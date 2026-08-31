import { Response, NextFunction } from "express";
import { AsyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";
import { InvoiceService } from "../services/invoice.service";

export const listInvoices = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { patientId } = req.params;
    const invoices = await InvoiceService.listByPatient(patientId as string);
    return ApiResponse.ok(res, "Invoices fetched successfully", invoices);
  }
);

export const createInvoice = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;

    if (!patientId || !req.admin) {
      return next(ApiError.forbidden("Admin access required"));
    }

    const invoice = await InvoiceService.create(
      patientId as string,
      req.admin.organizationId,
      req.admin.id,
      req.body
    );
    return ApiResponse.created(res, "Invoice created successfully", invoice);
  }
);

export const markInvoicePaid = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId, invoiceId } = req.params;

    if (!req.admin) {
      return next(ApiError.forbidden("Admin access required"));
    }

    const invoice = await InvoiceService.markPaid(
      patientId as string,
      invoiceId as string
    );
    return ApiResponse.ok(res, "Invoice marked as paid successfully", invoice);
  }
);
