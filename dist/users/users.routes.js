"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
const database = __importStar(require("./user.database"));
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.userRouter = (0, express_1.Router)();
exports.userRouter.get("/users", asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield database.findAll();
    if (!allUsers) {
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ msg: 'No users at this time...' });
        return;
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ total_user: allUsers.length, allUsers });
})));
exports.userRouter.get("/user/:id", asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield database.findOne(req.params.id);
    if (!user) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'User not found!' });
    }
    return res.status(http_status_codes_1.StatusCodes.OK).json(user);
})));
exports.userRouter.post("/register", asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: 'Please provide all the required parameters..' });
    }
    const user = yield database.findByEmail(email);
    if (user) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: 'This email has already been registered..' });
    }
    const newUser = yield database.create(req.body);
    return res.status(http_status_codes_1.StatusCodes.CREATED).json(newUser);
})));
exports.userRouter.post("/login", asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters.." });
    }
    const user = yield database.findByEmail(email);
    if (!user) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: "No user exists with the email provided.." });
    }
    const comparePassword = yield database.comparePassword(email, password);
    if (!comparePassword) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: 'Incorrect Password!' });
    }
    return res.status(http_status_codes_1.StatusCodes.OK).json(user);
})));
exports.userRouter.put("/user/:id", asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    const getUser = yield database.findOne(req.params.id);
    if (!username || !email || !password) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: 'Please provide all the required parameters..' });
    }
    if (!getUser) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: `No user with id ${req.params.id}` });
    }
    const updateUser = yield database.update(req.params.id, req.body);
    return res.status(http_status_codes_1.StatusCodes.OK).json(updateUser);
})));
exports.userRouter.delete("/user/:id", asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const user = yield database.findOne(id);
    if (!user) {
        return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'User does not exist' });
    }
    yield database.remove(id);
    return res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "User deleted" });
})));
