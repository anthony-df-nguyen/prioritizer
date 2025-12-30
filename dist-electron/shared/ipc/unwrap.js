"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapIpcResult = unwrapIpcResult;
function unwrapIpcResult(res) {
    if (!res.ok) {
        throw new Error(res.error.message);
    }
    return res.data;
}
