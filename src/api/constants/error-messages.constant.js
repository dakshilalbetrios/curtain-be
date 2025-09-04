module.exports = {
  // Appointment Validation Errors
  INVALID_SCHEDULED_DATETIME: "400::Scheduled datetime is invalid.",
  INVALID_PATIENT_ID: "400::Patient ID is invalid.",
  INVALID_PATIENT_NAME: "400::Patient name is invalid.",
  INVALID_PATIENT_MOBILE_NO: "400::Patient mobile number is invalid.",
  INVALID_BRANCH_ID: "400::Branch ID is invalid.",
  INVALID_SERVICE_TYPE: "400::Service type is invalid.",
  INVALID_APPOINTED_TO_USER_ID: "400::Appointed user ID is invalid.",
  INVALID_NOTES: "400::Notes are invalid.",
  INVALID_DURATION: "400::Duration in minutes is invalid.",
  INVALID_STATUS: "400::Status is invalid.",
  INVALID_CREATED_BY: "400::Created by user ID is invalid.",
  INVALID_UPDATED_BY: "400::Updated by user ID is invalid.",
  INVALID_APPOINTMENT_ID: "400::Appointment ID is invalid.",
  PATIENT_ALREADY_EXISTS: "400::Patient with this mobile number already exists",

  // Branch Validation Errors
  INVALID_BRANCH_SLUG:
    "400::Branch slug is invalid. It must contain only lowercase letters, numbers, and hyphens.",
  INVALID_BRANCH_NAME: "400::Branch name is invalid or missing.",

  // Call Validation Errors
  INVALID_CALL_TYPE: "400::Invalid call type.",
  INVALID_CALL_BY: "400::Invalid call by user ID.",
  INVALID_CALL_DATETIME: "400::Invalid call datetime.",
  INVALID_CALL_ID: "400::Invalid call ID.",

  // Clinic Invoice Validation Errors//
  INVALID_DOCTOR_ID: "400::Invalid doctor ID.",
  INVALID_THERAPIST_ID: "400::Invalid therapist ID.",
  INVALID_COUNSELLOR_ID: "400::Invalid counsellor ID.",
  INVALID_TOTAL_AMOUNT: "400::Invalid total amount.",
  INVALID_DISCOUNT: "400::Invalid discount.",
  INVALID_GST: "400::Invalid GST.",
  INVALID_FINAL_AMOUNT: "400::Invalid final amount.",
  INVALID_DUE_AMOUNT: "400::Invalid due amount.",
  INVALID_CLINIC_DUE_AMOUNT: "400::Invalid clinic due amount.",
  INVALID_PAID_AMOUNT: "400::Invalid paid amount.",
  INVALID_BALANCE_DUE: "400::Invalid balance due.",
  INVALID_INVOICE_STATUSES: "400::Invalid invoice status.",
  INVALID_PAYMENT_DUE_DATE: "400::Invalid payment due date.",
  INVALID_INVOICE_ID: "400::Invalid invoice ID.",
  INVALID_REMARKS: "400::Invalid remarks.",
  // Clinic Invoices Services Validation Errors//
  INVALID_TOTAL_SESSIONS: "400::Invalid total sessions.",
  INVALID_UNIT_PRICE: "400::Invalid unit price.",
  INVALID_QUANTITY: "400::Invalid quantity.",
  INVALID_FINAL_PRICE: "400::Invalid final price.",
  INVALID_INVOICE_SERVICE_ID: "400::Invalid invoice service ID.",

  // Complaint Validation Errors
  INVALID_COMPLAINT_DESCRIPTION:
    "400::Complaint description is invalid or missing.",
  INVALID_COMPLAINT_ID: "400::Invalid complaint ID.",

  // Diagnosis Validation Errors
  INVALID_DIAGNOSIS_DETAILS: "400::Diagnosis details are invalid or missing.",
  INVALID_DIAGNOSIS_ID: "400::Invalid diagnosis ID.",

  // Future Suggestions Validation Errors//
  INVALID_SUGGESTION: "400::Suggestion is invalid or missing.",
  INVALID_SUGGESTION_ID: "400::Invalid suggestion ID.",

  // Image Validation Errors
  INVALID_IMAGE_URL: "400::Invalid image URL.",
  INVALID_IMAGE_KEY: "400::Invalid image key.",
  INVALID_IMAGE_NAME: "400::Invalid image name.",
  INVALID_IMAGE_SIZE: "400::Invalid image size.",
  INVALID_IMAGE_MIME_TYPE: "400::Invalid image MIME type.",
  INVALID_THUMBNAIL_URL: "400::Invalid thumbnail URL.",
  INVALID_THUMBNAIL_KEY: "400::Invalid thumbnail key.",
  INVALID_IMAGE_CATEGORY: "400::Invalid image category.",
  INVALID_IMAGE_ID: "400::Invalid image ID.",
  IMAGE_NOT_FOUND: "404::Image not found.",
  INVALID_FILE_TYPE:
    "400::Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
  FILE_NOT_FOUND_IN_S3: "404::File does not exist in S3.",
  INVALID_FILE_SIZE: "400::File size exceeds the maximum limit of 10MB.",

  // Lead Validation Errors
  INVALID_ENGAGEMENT_MODE: "400::Invalid engagement mode.",
  INVALID_SOURCE: "400::Invalid engagement source.",
  INVALID_FOLLOW_UP_DATE: "400::Invalid follow-up date.",
  INVALID_LAST_CONTACTED_AT: "400::Invalid last contacted date.",
  INVALID_CONVERTED_AT: "400::Invalid converted date.",
  INVALID_REFERRED_BY_NAME: "400::Invalid referred by name.",
  INVALID_REFERRED_BY_TYPE: "400::Invalid referred by type.",
  INVALID_ASSIGNED_TO: "400::Invalid assigned to user ID.",
  INVALID_LEAD_ID: "400::Invalid lead ID.",
  INVALID_WHATSAPP_NO: "400::Invalid WhatsApp number.",
  INVALID_INSTAGRAM_USERNAME: "400::Invalid Instagram username.",

  // organization Validation Errors//
  INVALID_ORGANIZATION_SLUG:
    "400::Invalid clinic slug. It must contain only lowercase letters, numbers, and hyphens.",
  INVALID_ORGANIZATION_NAME: "400::organization name is invalid or missing.",
  INVALID_EMAIL: "400::Invalid email.",
  INVALID_CONTACT_MOBILE_NO: "400::Invalid contact mobile number.",

  // Patient Validation Errors//
  INVALID_FIRST_NAME: "400::First name is invalid or missing.",
  INVALID_LAST_NAME: "400::Last name is invalid.",
  INVALID_GENDERS: "400::Invalid GENDERS.",
  INVALID_BIRTH_DATE: "400::Invalid birth date.",
  INVALID_AGE: "400::Invalid age.",
  INVALID_ADDRESS: "400::Invalid address.",
  INVALID_PATIENT_TYPE: "400::Invalid patient type.",
  INVALID_PRESCRIPTION_MEDICINES: "400::Invalid prescription medicines.",
  INVALID_PRESCRIPTIONS_ARRAY: "400::Invalid prescriptions array.",
  INVALID_PATIENT_STATUS: "400::Invalid patient status.",
  INVALID_CONVERSION_STATUS: "400::Invalid conversion status.",
  // Prescription Medicines Validation Errors
  INVALID_MEDICINE_NAME: "400::Medicine name is invalid or missing.",
  INVALID_DOSAGE: "400::Invalid dosage.",
  INVALID_WHEN_TAKE: "400::Invalid 'when_take' field.",
  INVALID_WHERE_TAKE: "400::Invalid 'where_take' field.",
  INVALID_QTY: "400::Invalid quantity.",
  INVALID_INSTRUCTION: "400::Invalid instruction.",
  INVALID_MEDICINE_ID: "400::Invalid medicine ID.",

  // Prescriptions Validation Errors
  INVALID_PRESCRIBED_BY: "400::Prescribed by user ID is invalid or missing.",
  INVALID_PRESCRIBED_AT: "400::Invalid prescribed date.",
  INVALID_PRESCRIPTION_ID: "400::Invalid prescription ID.",
  INVALID_LAB_REPORT: "400::Invalid lab report.",
  INVALID_TODAY_PROCEDURES: "400::Invalid today procedures.",

  // Services Validation Errors
  INVALID_SERVICE_NAME: "400::Service name is invalid or missing.",
  INVALID_SERVICE_DESCRIPTION: "400::Service description is invalid.",
  INVALID_CATEGORY: "400::Invalid service category.",
  INVALID_PRICE: "400::Service price is invalid or missing.",
  INVALID_GST_RATE: "400::GST rate is invalid.",
  INVALID_IS_GST_INCLUSIVE: "400::GST inclusive flag is invalid.",
  INVALID_IS_ACTIVE: "400::Active status is invalid.",
  INVALID_SERVICE_ID: "400::Invalid service ID.",

  // Transactions Validation Errors
  INVALID_INVOICE_ID: "400::Invalid invoice ID.",
  INVALID_AMOUNT: "400::Invalid amount.",
  INVALID_PAYMENT_MODE: "400::Invalid payment mode.",
  INVALID_TRANSACTION_ID: "400::Invalid transaction ID.",

  //Treatment Validation Errors
  INVALID_UNDER_OBSERVATION_DOCTOR_USER_ID: "400::Invalid doctor user ID.",
  INVALID_THERAPIST_TYPE: "400::Invalid therapist type.",
  INVALID_TREATMENT_NAME: "400::Invalid treatment name.",
  INVALID_BODY_PART: "400::Invalid body part.",
  INVALID_SESSION_NUMBER: "400::Invalid session number.",
  INVALID_SKIN_TYPE: "400::Invalid skin type.",
  INVALID_MACHINE_NAME: "400::Invalid machine name.",
  INVALID_MACHINE_STARTING_READING: "400::Invalid starting reading.",
  INVALID_MACHINE_ENDING_READING: "400::Invalid ending reading.",
  INVALID_POWER_DURATION: "400::Invalid power duration.",
  INVALID_WAVELENGTH: "400::Invalid wavelength.",
  INVALID_REMARK: "400::Invalid remark.",
  INVALID_DATE: "400::Invalid date.",
  INVALID_TREATMENT_ID: "400::Invalid treatment ID.",

  //User Validation Errors
  INVALID_PASSWORD: "400::Invalid password.",
  INVALID_USER_TYPE: "400::Invalid user type.",
  INVALID_ORGANIZATION: "400::Invalid organization slug.",
  INVALID_USER_ID: "400::Invalid user ID.",

  //Leads Services Errors
  ALREADY_EXISTED_LEAD: "400::Lead with this mobile number already exists",

  //Organization Services Errors
  ALREADY_EXISTED_ORGANIZATION: "400::Organization already exists",

  //Patient Services Errors
  ALREADY_EXISTED_PATIENT_WITH_PHONE_NO:
    "400::Patient with this mobile number already exists",

  //Patient Services Errors
  ALREADY_EXISTED_SERVICES_WITH_NAME:
    "400::Service with this name already exists",

  //Patient Services Errors
  ALREADY_EXISTED_SERVICES_WITH_NAME:
    "400::Service with this name already exists",

  //User Services Errors
  ALREADY_EXISTED_USER: "400::User already exists",

  //Appointment Controller Errors
  APPOINTMENT_NOT_FOUND: "400::Appointment not found.",

  //Branch Controller Errors
  BRANCH_NOT_FOUND: "400::Branch not found.",

  //Clinic invoice Controller Errors
  CLINIC_INVOICE_NOT_FOUND: "400::Clinic invoice not found",

  //Clinic invoice service Controller Errors
  CLINIC_INVOICE_SERVICE_NOT_FOUND: "400::Clinic invoice service not found",

  //Complaint Controller Errors
  COMPLAINT_NOT_FOUND: "400::Complaint not found.",

  //Diagnosis Controller Errors
  DIAGNOSIS_NOT_FOUND: "400::Diagnosis not found.",

  //Future suggestion Controller Errors
  FUTURE_SUGGESTION_NOT_FOUND: "400::Future suggestion not found",

  //Lead Controller Errors
  LEAD_NOT_FOUND: "400::Lead not found",

  //Patient Controller Errors
  PATIENT_NOT_FOUND: "400::Patient not found.",

  //Offering Controller Errors
  OFFERING_NOT_FOUND: "400::Offering not found",

  //Prescription Controller Errors
  PRESCRIPTION_NOT_FOUND: "400::Prescription not found",

  //Prescription medicine Controller Errors
  PRESCRIPTION_MEDICINE_NOT_FOUND: "400::Prescription medicine not found",

  //Service Controller Errors
  SERVICE_NOT_FOUND: "400::Service not found",

  //Transaction Controller Errors
  TRANSACTION_NOT_FOUND: "400::Transaction not found",

  //Treatment suggestion Controller Errors
  TREATMENT_SUGGESTION_NOT_FOUND: "400::Treatment suggestion not found",

  //Treatment Controller Errors
  TREATMENT_NOT_FOUND: "400::Treatment not found",

  //Organization Controller Errors
  ORGANIZATION_RESTRICTION:
    "400::Only MASTER_ADMIN users can create, update or delete organizations",
  ORGANIZATION_NOT_FOUND: "400::Organization not found",

  // Authentication and Authorization Errors
  UNAUTHORIZED:
    "401::Unauthorized access. Please log in with valid credentials.",
  USER_RESIGNED:
    "401::User account has been resigned. Please contact administrator.",
  USER_INACTIVE: "401::User account is inactive. Please contact administrator.",
  ORGANIZATION_NOT_ACTIVE:
    "401::Organization is not active. Please contact administrator.",
  // Not Found Errors
  API_NOT_FOUND: "404::Requested API endpoint not found.",
  CLINIC_NOT_FOUND: "404::The requested clinic was not found.",
  USER_NOT_FOUND: "401::Invalid email or password.",

  // Server Errors
  INTERNAL_SERVER_ERROR:
    "500::An unexpected error occurred. Please try again later.",

  // Registration and Token Errors
  CLINIC_ALREADY_REGISTERED:
    "200::This clinic is already registered with the provided details.",
  USER_EMAIL_ALREADY_REGISTERED:
    "200::This email address is already registered with a user account.",
  EMAIL_VERIFY_TOKEN_INVALID:
    "200::The email verification link for this user is invalid or has expired.",
  RESET_PASSWORD_TOKEN_INVALID:
    "200::The password reset link for this user is invalid or has expired.",
  JOIN_CLINIC_TOKEN_INVALID:
    "200::The invitation link to join the clinic is invalid or has expired. Please request a new invitation from the clinic administrator.",

  // Status and Type Validation Errors
  INVALID_CLINIC_STATUS:
    "200::The specified clinic status is invalid. Allowed values are ACTIVE, INACTIVE, or DELETED.",
  INVALID_USER_STATUSES:
    "200::The specified user status is invalid. Allowed values are ACTIVE, RESIGNED, or INACTIVE.",

  //Users Validation Errors//
  FIRST_NAME: "400::First name is invalid.",
  LAST_NAME: "400::Last name is invalid.",
  USER_TYPE: "400::User Type invalid.",
  PASSWORD: "400::Password hash is invalid or missing.",
  ORGANIZATION: "400::Invalid clinic reference in organization_slug.",
  USER_ID: "400::Invalid user ID. It must be a positive integer.",

  // Medicine Transaction Errors
  MEDICINE_TRANSACTION_NOT_FOUND: "Medicine transaction not found",
  PURCHASE_ORDER_NOT_FOUND: "Purchase order not found",
  SUPPLIER_NOT_FOUND: "Supplier not found",

  // Supplier Validation Errors
  INVALID_SUPPLIER_NAME: "400::Supplier name is invalid or missing.",
  INVALID_CONTACT_PERSON: "400::Contact person name is invalid or missing.",
  INVALID_GST_NUMBER: "400::Invalid GST number format.",
  INVALID_SUPPLIER_ID: "400::Invalid supplier ID.",
  INVALID_MANUFACTURE: "400::Invalid manufacture.",

  // Medicine Validation Errors
  INVALID_MEDICINE_CATEGORY: "400::Medicine category is invalid or missing.",
  INVALID_MANUFACTURER: "400::Manufacturer name is invalid or missing.",
  INVALID_DESCRIPTION: "400::Medicine description is invalid.",
  INVALID_GENERIC_NAME: "400::Generic name is invalid.",
  INVALID_COMPOSITION: "400::Medicine composition is invalid.",
  INVALID_STRENGTH: "400::Medicine strength is invalid.",
  INVALID_DOSAGE_FORM: "400::Dosage form is invalid.",
  INVALID_PACK_SIZE: "400::Pack size is invalid.",
  INVALID_UNIT: "400::Unit is invalid.",
  INVALID_MRP: "400::MRP is invalid or missing.",
  INVALID_COST_PRICE: "400::Cost price is invalid or missing.",
  INVALID_SELL_PRICE: "400::Sell price is invalid or missing.",
  INVALID_TAX_RATE: "400::Tax rate is invalid.",
  INVALID_REQUIRES_PRESCRIPTION: "400::Requires prescription flag is invalid.",
  INVALID_PACK_QUANTITY: "400::Pack quantity is invalid.",
  // Medicine Transaction Validation Errors
  INVALID_PURCHASE_ORDER_ID: "400::Invalid purchase order ID.",
  INVALID_SALE_ID: "400::Invalid sale ID.",
  INVALID_TRANSACTION_TYPE: "400::Invalid transaction type.",

  // Chat Message Errors
  CHAT_MESSAGE_NOT_FOUND: "Chat message not found",
  INVALID_MESSAGE_TYPE:
    "Invalid message type. Allowed types are: appointment, lead",
  INVALID_RELATIVE_ID: "The referenced item does not exist",

  // Follow Up Date Validation Errors
  INVALID_REFERENCE_ID: "400::Reference ID is invalid.",
  INVALID_FOLLOW_UP_DATE_TYPE: "400::Follow-up date type is invalid.",
  INVALID_FOLLOW_UP_STATUS: "400::Follow-up status is invalid.",
  INVALID_FOLLOW_UP_OUTCOME: "400::Follow-up outcome is invalid.",
  INVALID_ATTEMPT_COUNT: "400::Attempt count is invalid.",
  INVALID_FOLLOW_UP_DATE_ID: "400::Follow-up date ID is invalid.",

  // Follow Up Date Controller Errors
  FOLLOW_UP_DATE_NOT_FOUND: "404::Follow-up date not found.",

  // Inside Inventory Item Validation Errors
  INVALID_ITEM_NAME: "400::Item name is invalid or missing.",
  INVALID_CATEGORY: "400::Category is invalid.",
  INVALID_UNIT: "400::Unit is invalid.",
  INVALID_CURRENT_STOCK: "400::Current stock is invalid.",
  INVALID_MIN_STOCK: "400::Min stock is invalid.",
  INVALID_MAX_STOCK: "400::Max stock is invalid.",
  INVALID_ITEM_ID: "400::Item ID is invalid.",
  INVALID_PURCHASE_ID: "400::Purchase ID is invalid.",
  INVALID_AMOUNT: "400::Amount is invalid.",
  INVALID_PAYMENT_MODE: "400::Payment mode is invalid.",
  INVALID_TRANSACTION_TYPE: "400::Transaction type is invalid.",

  // Inside Inventory Stock Movement Validation Errors
  INVALID_STOCK_MOVEMENT_ID: "400::Stock movement ID is invalid.",
  INVALID_ITEM_ID: "400::Item ID is invalid.",
  INVALID_TRANSACTION_TYPE: "400::Transaction type is invalid.",
  INVALID_ADD_QUANTITY: "400::Add quantity is invalid.",
  INVALID_REMARK: "400::Remark is invalid.",

  // Inside Inventory Purchase Validation Errors
  INVALID_INVOICE_ID: "400::Invoice ID is invalid.",
  INVALID_SUPPLIER_NAME: "400::Supplier name is invalid or missing.",
  INVALID_SUPPLIER_MOBILE: "400::Supplier mobile is invalid or missing.",
  INVALID_BILL_AMOUNT: "400::Bill amount is invalid or missing.",
  INVALID_PAYMENT_STATUS: "400::Payment status is invalid.",

  // Inside Inventory Transaction Validation Errors
  INVALID_PURCHASE_ID: "400::Purchase ID is invalid.",
  INVALID_AMOUNT: "400::Amount is invalid.",
  INVALID_TRANSACTION_TYPE: "400::Transaction type is invalid.",
  INVALID_REMARK: "400::Remark is invalid.",

  // Inside Inventory Controller Errors
  INSIDE_INVENTORY_ITEM_NOT_FOUND: "400::Inside inventory item not found.",
  INSIDE_INVENTORY_STOCK_MOVEMENT_NOT_FOUND:
    "400::Inside inventory stock movement not found.",
  INSIDE_INVENTORY_PURCHASE_NOT_FOUND:
    "400::Inside inventory purchase not found.",
  INSIDE_INVENTORY_TRANSACTION_NOT_FOUND:
    "400::Inside inventory transaction not found.",
};
