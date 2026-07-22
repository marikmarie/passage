-- Add rider document metadata fields for onboarding review.
-- These fields can store local paths, storage object keys, or signed/uploaded URLs.

ALTER TABLE riders
  ADD COLUMN national_id_front_url VARCHAR(500) NULL AFTER national_id_number,
  ADD COLUMN national_id_back_url VARCHAR(500) NULL AFTER national_id_front_url,
  ADD COLUMN profile_photo_url VARCHAR(500) NULL AFTER national_id_back_url,
  ADD COLUMN driving_licence_image_url VARCHAR(500) NULL AFTER driving_licence_number,
  ADD COLUMN permit_image_url VARCHAR(500) NULL AFTER permit_number,
  ADD COLUMN vehicle_photo_url VARCHAR(500) NULL AFTER number_plate;