import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Post, Category, User } from '../models';
import { AuthRequest } from '../middleware/auth';

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

    const fullPost = await Post.findByPk(post.id, {
      include: [
        { model: Category },
        { model: User, as: 'author', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
    });

    res.status(201).json(fullPost);
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

    const { title, content, status, isFeatured, categoryId, publishedAt, tags } = req.body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (status !== undefined) {
      updates.status = status;
      // Auto-set publishedAt when publishing for the first time
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<any> => {
  try {
    const post = await Post.findByPk(req.params.id as string);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

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
