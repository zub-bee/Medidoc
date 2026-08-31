import { Response, NextFunction } from "express";
import { AsyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";
import { PaymentService } from "../services/payment.service";

export const listPayments = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { patientId, invoiceId } = req.params;
    const payments = await PaymentService.listByInvoice(
      patientId as string,
      invoiceId as string
    );
    return ApiResponse.ok(res, "Payments fetched successfully", payments);
  }
);

export const createPayment = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId, invoiceId } = req.params;

    if (!req.admin) {
      return next(ApiError.forbidden("Admin access required"));
    }

    const payment = await PaymentService.create(
      patientId as string,
      invoiceId as string,
      req.admin.id,
      req.body
    );
    return ApiResponse.created(res, "Payment recorded successfully", payment);
  }
);
