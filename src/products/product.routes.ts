import { Router, Request, Response, NextFunction } from "express";
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
    if (!allProducts.length) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'No products at this time...' });
    }
    return res.status(StatusCodes.OK).json({ total_products: allProducts.length, allProducts });
}));

productRouter.get("/product/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid ID format' });
    }

    const product = await database.findOne(id);
    if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Product not found!' });
    }
    return res.status(StatusCodes.OK).json(product);
}));

productRouter.post("/product", asyncHandler(async (req: Request, res: Response) => {
    const { name, price, quantity, image } = req.body;
    if (!name || !price || !quantity || !image) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            error: 'Please provide all the required parameters..' 
        });
    }

    const newProduct = await database.create(req.body);
    return res.status(StatusCodes.CREATED).json(newProduct);
}));

productRouter.put("/product/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid ID format' });
    }

    const { name, price, quantity, image } = req.body;
    if (!name || !price || !quantity || !image) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            error: 'Please provide all the required parameters..' 
        });
    }
    
    const updateProduct = await database.update(id, req.body);
    if (!updateProduct) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: `No product with id ${id}` });
    }
    
    return res.status(StatusCodes.OK).json(updateProduct);
}));

productRouter.delete("/product/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid ID format' });
    }

    const success = await database.remove(id);
    if (!success) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'Product does not exist' });
    }
    return res.status(StatusCodes.OK).json({ msg: "Product deleted" });
}));