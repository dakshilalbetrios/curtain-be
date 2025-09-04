const FollowUpDateService = require("../follow-up-dates/follow-up-date.service");
const { FOLLOW_UP_STATUS } = require("../../api/constants/common");

class FollowUpDateHelperService {
  constructor(context) {
    this.context = context;
    this.followUpDateService = new FollowUpDateService(context);
  }

  /**
   * Create follow-up date if provided in the data
   * @param {Object} params - Parameters object
   * @param {string} params.type - Type of follow-up date (APPOINTMENTS, PATIENTS, LEADS, TREATMENTS)
   * @param {number} params.referenceId - ID of the referenced entity
   * @param {Date} params.followUpDate - Follow-up date
   * @param {Object} params.trx - Transaction object
   * @returns {Promise<Object|null>} Created follow-up date or null
   */
  async createFollowUpDateIfProvided({
    type,
    referenceId,
    followUpDate,
    patientName,
    patientPhone,
    trx,
  }) {
    try {
      // Only create follow-up date if it's provided
      if (!followUpDate) {
        return null;
      }

      const followUpDateData = {
        reference_id: referenceId,
        type: type,
        follow_up_date: followUpDate,
        patient_name: patientName,
        patient_phone: patientPhone,
        status: FOLLOW_UP_STATUS.PENDING,
      };

      return await this.followUpDateService.createFollowUpDate({
        followUpDateData,
        trx,
      });
    } catch (error) {
      // Log error but don't fail the main operation
      console.error(
        `Failed to create follow-up date for ${type}:`,
        error.message
      );
      return null;
    }
  }

  /**
   * Update follow-up date if provided in the data
   * @param {Object} params - Parameters object
   * @param {string} params.type - Type of follow-up date (APPOINTMENTS, PATIENTS, LEADS, TREATMENTS)
   * @param {number} params.referenceId - ID of the referenced entity
   * @param {Date} params.followUpDate - Follow-up date
   * @param {Object} params.trx - Transaction object
   * @returns {Promise<Object|null>} Updated follow-up date or null
   */
  async updateFollowUpDateIfProvided({
    type,
    referenceId,
    followUpDate,
    patientName,
    patientPhone,
    trx,
  }) {
    try {
      // Only update follow-up date if it's provided
      if (!followUpDate) {
        return null;
      }

      // First, find existing follow-up date for this reference
      const { data: existingFollowUpDates } =
        await this.followUpDateService.getAllFollowUpDates({
          params: {
            reference_id_eq: referenceId,
            type_eq: type,
          },
          trx,
        });

      if (existingFollowUpDates && existingFollowUpDates.length > 0) {
        // Update existing follow-up date
        const existingFollowUpDate = existingFollowUpDates[0];
        return await this.followUpDateService.updateFollowUpDate({
          followUpDateId: existingFollowUpDate.id,
          followUpDateData: {
            follow_up_date: followUpDate,
            patient_name: patientName,
            patient_phone: patientPhone,
            attempt_count:
              existingFollowUpDate.status === FOLLOW_UP_STATUS.PENDING
                ? existingFollowUpDate.attempt_count
                : existingFollowUpDate.attempt_count + 1,
          },
          trx,
        });
      } else {
        // Create new follow-up date
        return await this.createFollowUpDateIfProvided({
          type,
          referenceId,
          followUpDate,
          patientName,
          patientPhone,
          trx,
        });
      }
    } catch (error) {
      // Log error but don't fail the main operation
      console.error(
        `Failed to update follow-up date for ${type}:`,
        error.message
      );
      return null;
    }
  }
}

module.exports = FollowUpDateHelperService;
