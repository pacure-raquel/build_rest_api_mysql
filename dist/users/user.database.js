"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.comparePassword = exports.findByEmail = exports.create = exports.findOne = exports.findAll = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
let users = loadUsers();
function loadUsers() {
    try {
        const data = fs_1.default.readFileSync("./users.json", "utf-8");
        return JSON.parse(data);
    }
    catch (error) {
        console.log(`Error ${error}`);
        return {};
    }
}
function saveUsers() {
    try {
        fs_1.default.writeFileSync("./users.json", JSON.stringify(users), "utf-8");
        console.log('User saved successfully!');
    }
    catch (error) {
        console.log(`Error: ${error}`);
    }
}
const findAll = () => __awaiter(void 0, void 0, void 0, function* () { return Object.values(users); });
exports.findAll = findAll;
const findOne = (id) => __awaiter(void 0, void 0, void 0, function* () { return users[id]; });
exports.findOne = findOne;
const create = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    let id = (0, uuid_1.v4)();
    let check_user = yield (0, exports.findOne)(id);
    while (check_user) {
        id = (0, uuid_1.v4)();
        check_user = yield (0, exports.findOne)(id);
    }
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(userData.password, salt);
    const user = {
        id: id,
        username: userData.username,
        email: userData.email,
        password: hashedPassword
    };
    users[id] = user;
    saveUsers();
    return user;
});
exports.create = create;
const findByEmail = (user_email) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield (0, exports.findAll)();
    const getUser = allUsers.find(result => user_email === result.email);
    if (!getUser) {
        return null;
    }
    return getUser;
});
exports.findByEmail = findByEmail;
const comparePassword = (email, supplied_password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findByEmail)(email);
    if (!user) {
        return null;
    }
    const decryptPassword = yield bcryptjs_1.default.compare(supplied_password, user.password);
    if (!decryptPassword) {
        return null;
    }
    return user;
});
exports.comparePassword = comparePassword;
const update = (id, updateValues) => __awaiter(void 0, void 0, void 0, function* () {
    const userExists = yield (0, exports.findOne)(id);
    if (!userExists) {
        return null;
    }
    if (updateValues.password) {
        const salt = yield bcryptjs_1.default.genSalt(10);
        const newPass = yield bcryptjs_1.default.hash(updateValues.password, salt);
        updateValues.password = newPass;
    }
    users[id] = Object.assign(Object.assign({}, userExists), updateValues);
    saveUsers();
    return users[id];
});
exports.update = update;
const remove = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findOne)(id);
    if (!user) {
        return null;
    }
    delete users[id];
    saveUsers();
});
exports.remove = remove;
