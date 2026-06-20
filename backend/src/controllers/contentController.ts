import { Request, Response } from 'express';
import { Post, Category } from '../models';
import { AuthRequest } from '../middleware/auth';
import { socketService } from '../server';

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, isFeatured, categoryId, publishedAt } = req.body;
    const post = await Post.create({
      title,
      content,
      isFeatured,
      categoryId,
      publishedAt,
      authorId: req.user!.id
    });
    
    // Emit notification to users room if featured
    if (isFeatured) {
      socketService.emitSystemAlert({ message: `New featured post: ${title}` });
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.findAll({ include: [Category] });
    res.json(posts);
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
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
