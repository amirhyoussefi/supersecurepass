import { Request, Response } from "express";
import { LitInput } from "../schemas/lit.schema";
import { Lit } from "../server";

export const litController = async (req: Request<{}, {}, LitInput>, res: Response) => {
  try {
    let { ciphertext, dataToEncryptHash } = req.body;
    const lit = req.app.locals.lit as Lit;
    res.status(200).json({ message: await lit.decrypt(ciphertext, dataToEncryptHash) });
  } catch (error: any) {
    res.status(500).json({
      error: {
        message: error.message
      }
    });
  }
};
