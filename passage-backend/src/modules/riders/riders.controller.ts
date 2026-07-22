import { Request, Response } from 'express';
import { ridersService } from './riders.service';
import { BaseController } from '../base.controller';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../utils/errors.util';

class RidersController extends BaseController {
  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) throw new UnauthorizedError();

      const rider = await ridersService.getRiderByUserId(user.id);
      this.sendSuccess(res, rider ? 'Rider profile retrieved successfully' : 'No rider profile found', rider);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async upsertMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) throw new UnauthorizedError();
      if (user.role !== 'rider') {
        throw new ValidationError('Only rider accounts can submit rider profiles.');
      }

      const rider = await ridersService.upsertCurrentRiderProfile(user.id, this.normalizeProfilePayload(req.body));
      this.sendSuccess(res, 'Rider profile saved successfully', rider);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const rider = await ridersService.getRiderById(id);

      this.ensureResourceExists(rider, 'Rider');
      this.sendSuccess(res, 'Rider retrieved successfully', rider);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async getByParentId(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = this.parsePaginationParams(req.query);
      const parentUserId = this.getUserId(req as any);

      const result = await ridersService.getRidersByParentId(parentUserId, page, limit);
      const pagination = this.calculatePaginationMeta(result.total, page, limit);
      this.sendPaginatedSuccess(res, 'Riders retrieved successfully', result.riders, pagination);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      this.validateRequiredFields(req.body, ['user_id']);
      const rider = await ridersService.createRider(this.normalizeProfilePayload(req.body));
      this.sendSuccess(res, 'Rider created successfully', rider, 201);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const rider = await ridersService.updateRider(id, this.normalizeProfilePayload(req.body));

      this.ensureResourceExists(rider, 'Rider');
      this.sendSuccess(res, 'Rider updated successfully', rider);
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id);
      const success = await ridersService.deleteRider(id);

      if (!success) {
        throw new NotFoundError('Rider');
      }

      this.sendSuccess(res, 'Rider deleted successfully', { id });
    } catch (error) {
      this.handleApiError(res, error);
    }
  }

  private normalizeProfilePayload(body: any): any {
    const yearsOfRiding = body.years_of_riding ?? body.yearsOfRiding;

    return {
      user_id: body.user_id,
      parent_user_id: body.parent_user_id,
      school: body.school,
      grade: body.grade,
      full_name: body.full_name ?? body.fullName,
      date_of_birth: body.date_of_birth ?? body.dateOfBirth,
      nationality: body.nationality,
      national_id_number: body.national_id_number ?? body.nationalIdNumber,
      national_id_front_url: body.national_id_front_url ?? body.nationalIdFrontUrl,
      national_id_back_url: body.national_id_back_url ?? body.nationalIdBackUrl,
      profile_photo_url: body.profile_photo_url ?? body.profilePhotoUrl,
      residential_area: body.residential_area ?? body.residentialArea,
      stage_association: body.stage_association ?? body.stageAssociation,
      driving_licence_number: body.driving_licence_number ?? body.drivingLicenceNumber,
      driving_licence_image_url: body.driving_licence_image_url ?? body.drivingLicenceImageUrl,
      permit_number: body.permit_number ?? body.permitNumber,
      permit_image_url: body.permit_image_url ?? body.permitImageUrl,
      licence_expiry_date: body.licence_expiry_date ?? body.licenceExpiryDate,
      years_of_riding: yearsOfRiding === undefined || yearsOfRiding === '' ? undefined : Number(yearsOfRiding),
      authorised_vehicle_class: body.authorised_vehicle_class ?? body.authorisedVehicleClass,
      vehicle_type: body.vehicle_type ?? body.vehicleType,
      number_plate: body.number_plate ?? body.numberPlate,
      vehicle_photo_url: body.vehicle_photo_url ?? body.vehiclePhotoUrl,
      ownership_status: body.ownership_status ?? body.ownershipStatus,
      insurance_info: body.insurance_info ?? body.insuranceInfo,
      insurance_expiry_date: body.insurance_expiry_date ?? body.insuranceExpiryDate,
      verification_consent_accepted: body.verification_consent_accepted ?? body.verificationConsentAccepted,
      training_accepted: body.training_accepted ?? body.trainingAccepted,
      safeguarding_accepted: body.safeguarding_accepted ?? body.safeguardingAccepted,
      approval_status: body.approval_status ?? body.approvalStatus,
      submitted_at: body.submitted_at ?? body.submittedAt,
    };
  }
}

export const ridersController = new RidersController();
