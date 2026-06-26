import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Post, Category, User, PostVersion } from '../models';
import { AuthRequest } from '../middleware/auth';
import { socketService } from '../server';

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, status, isFeatured, categoryId, publishedAt, tags } = req.body;
    const post = await Post.create({
      title,
      content,
      status: status || 'draft',
      isFeatured: isFeatured || false,
      categoryId: categoryId || null,
      publishedAt: status === 'published' ? (publishedAt || new Date()) : publishedAt,
      tags: tags || [],
      authorId: req.user!.id,
    });

    // Create initial version snapshot
    await PostVersion.create({
      postId: post.id,
      version: 1,
      title: post.title,
      content: post.content,
      status: post.status,
      editedById: req.user!.id,
      changeNote: 'Initial creation',
    });

    const fullPost = await Post.findByPk(post.id, {
      include: [
        { model: Category },
        { model: User, as: 'author', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
    });

    res.status(201).json(fullPost);

    // Emit real-time events
    if (socketService) {
      socketService.emitActivityLog({
        action: 'CREATE_POST',
        userId: req.user!.id,
        entityType: 'Post',
        entityId: post.id,
        message: `Created post: "${title}"`,
        timestamp: new Date(),
      });
      if (status === 'published') {
        socketService.emitContentUpdate({ id: post.id, title, action: 'published' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const featured = req.query.featured as string;
    const categoryId = req.query.categoryId as string;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) where.status = status;
    if (featured === 'true') where.isFeatured = true;
    if (categoryId) where.categoryId = parseInt(categoryId);

    const { count, rows: posts } = await Post.findAndCountAll({
      where,
      include: [
        { model: Category },
        { model: User, as: 'author', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      posts,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<any> => {
  try {
    const post = await Post.findByPk(req.params.id as string, {
      include: [
        { model: Category },
        { model: User, as: 'author', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const post = await Post.findByPk(req.params.id as string);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Save current state as a new version BEFORE applying updates
    const latestVersion = await PostVersion.findOne({
      where: { postId: post.id },
      order: [['version', 'DESC']],
    });
    const nextVersion = (latestVersion?.version || 0) + 1;

    await PostVersion.create({
      postId: post.id,
      version: nextVersion,
      title: post.title,
      content: post.content,
      status: post.status,
      editedById: req.user!.id,
      changeNote: req.body.changeNote || null,
    });

    // Now apply updates
    const { title, content, status, isFeatured, categoryId, publishedAt, tags } = req.body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'published' && !post.publishedAt) {
        updates.publishedAt = publishedAt || new Date();
      }
    }
    if (isFeatured !== undefined) updates.isFeatured = isFeatured;
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (publishedAt !== undefined) updates.publishedAt = publishedAt;
    if (tags !== undefined) updates.tags = tags;

    await post.update(updates);

    const updated = await Post.findByPk(post.id, {
      include: [
        { model: Category },
        { model: User, as: 'author', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
    });

    res.json(updated);

    // Emit real-time events
    if (socketService) {
      socketService.emitActivityLog({
        action: 'UPDATE_POST',
        userId: req.user!.id,
        entityType: 'Post',
        entityId: post.id,
        message: `Updated post: "${updated?.title || title}"`,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<any> => {
  try {
    const post = await Post.findByPk(req.params.id as string);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const postTitle = post.title;
    const postId = post.id;
    await post.destroy();

    // Emit real-time event
    if (socketService) {
      socketService.emitActivityLog({
        action: 'DELETE_POST',
        entityType: 'Post',
        entityId: postId,
        message: `Deleted post: "${postTitle}"`,
        timestamp: new Date(),
      });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// ─── Post Version History ───

export const getPostHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const postId = req.params.id as string;
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const versions = await PostVersion.findAll({
      where: { postId },
      include: [{ model: User, as: 'editor', attributes: ['id', 'email', 'firstName', 'lastName'] }],
      order: [['version', 'DESC']],
    });

    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const restorePostVersion = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const versionId = req.params.versionId as string;
    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const version = await PostVersion.findOne({
      where: { id: versionId, postId: id },
    });
    if (!version) return res.status(404).json({ message: 'Version not found' });

    // Save current state as a version before restoring
    const latestVersion = await PostVersion.findOne({
      where: { postId: post.id },
      order: [['version', 'DESC']],
    });
    const nextVersion = (latestVersion?.version || 0) + 1;

    await PostVersion.create({
      postId: post.id,
      version: nextVersion,
      title: post.title,
      content: post.content,
      status: post.status,
      editedById: req.user!.id,
      changeNote: `Before restore to v${version.version}`,
    });

    // Restore the post to the selected version
    await post.update({
      title: version.title,
      content: version.content,
      status: version.status,
    });

    const updated = await Post.findByPk(post.id, {
      include: [
        { model: Category },
        { model: User, as: 'author', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
    });

    res.json({ message: `Restored to version ${version.version}`, post: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// ─── Categories ───

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const category = await Category.findByPk(req.params.id as string);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const { name, description } = req.body;
    await category.update({ name, description });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const category = await Category.findByPk(req.params.id as string);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
