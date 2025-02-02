import express, { Router, Request, Response, NextFunction } from "express";
import { UnitProduct } from "./product.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./product.database";

const asyncHandler = (fn: Function) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

export const productRouter = Router();

productRouter.get("/products", asyncHandler(async (req: Request, res: Response) => {
    const allProducts: UnitProduct[] = await database.findAll();
    if (!allProducts) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'No products found!' });
    }
    return res.status(StatusCodes.OK).json({ total: allProducts.length, allProducts });
}));

// productRouter.get("/product/:id", asyncHandler(async (req: Request, res: Response) => {
//     const product: UnitProduct = await database.findOne(req.params.id);
//     if (!product) {
//         return res.status(StatusCodes.NOT_FOUND).json({ error: "Product does not exist" });
//     }
//     return res.status(StatusCodes.OK).json({ product });
// }));
productRouter.get("/product/:id", asyncHandler(async (req: Request, res: Response) => {
    const product: UnitProduct | null = await database.findOne(req.params.id);
    if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: "Product does not exist" });
    }
    return res.status(StatusCodes.OK).json({ product });
}));



productRouter.post("/product", asyncHandler(async (req: Request, res: Response) => {
    const { name, price, quantity, image } = req.body;
    if (!name || !price || !quantity || !image) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: 'Please provide all the required parameters..'
        });
    }
    const newProduct = await database.create(req.body);
    return res.status(StatusCodes.CREATED).json({ newProduct });
}));

productRouter.put("/product/:id", asyncHandler(async (req: Request, res: Response) => {
    const { name, price, quantity, image } = req.body;
    const findProduct = await database.findOne(req.params.id);

    if (!name || !price || !quantity || !image) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: 'Please provide all the required parameters..'
        });
    }
    
    if (!findProduct) {
        return res.status(StatusCodes.NOT_FOUND).json({
            error: 'Product does not exist..'
        });
    }

    const updateProduct = await database.update(req.params.id, req.body);
    return res.status(StatusCodes.OK).json({ updateProduct });
}));

productRouter.delete("/product/:id", asyncHandler(async (req: Request, res: Response) => {
    const getProduct = await database.findOne(req.params.id);
    if (!getProduct) {
        return res.status(StatusCodes.NOT_FOUND).json({
            error: `No product with ID ${req.params.id}`
        });
    }
    await database.remove(req.params.id);
    return res.status(StatusCodes.OK).json({
        msg: 'Product deleted.'
    });
}));