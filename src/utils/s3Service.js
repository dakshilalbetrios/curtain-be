const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const config = require("../configs");
const logger = require("./logger");

class S3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: config.AWS.S3.REGION,
      credentials: {
        accessKeyId: config.AWS.S3.ACCESS_KEY_ID,
        secretAccessKey: config.AWS.S3.SECRET_ACCESS_KEY,
      },
      forcePathStyle: config.AWS.S3.FORCE_PATH_STYLE,
    });
    this.bucketName = config.AWS.S3.BUCKET_NAME;
    this.bucketUrl = config.AWS.S3.BUCKET_URL;
  }

  /**
   * Generate a presigned URL for file upload
   * @param {string} fileName - Name of the file
   * @param {string} fileType - MIME type of the file
   * @param {number} patientId - Patient ID for folder organization
   * @param {boolean} isThumbnail - Whether this is a thumbnail upload
   * @returns {Promise<Object>} - Presigned URL and key
   */
  async generateUploadUrl(fileName, fileType, patientId, isThumbnail) {
    try {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedTypes.includes(fileType)) {
        throw new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        );
      }

      // Generate unique S3 key with patient ID and timestamp
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = fileName.split(".").pop();
      const key = `patients/${patientId}/${isThumbnail ? "thumbnail" : "image"}-${timestamp}-${randomId}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: fileType,
        ACL: "private",
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });

      logger.info("Presigned upload URL generated", {
        key,
        fileType,
        patientId,
        isThumbnail,
        expiresIn: 3600,
      });

      return {
        uploadUrl: presignedUrl,
        key: key,
        expiresIn: 3600,
      };
    } catch (error) {
      logger.error("Error generating presigned upload URL", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete a file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<Object>} - Delete result
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const result = await this.s3Client.send(command);

      logger.info("File deleted successfully from S3", { key });

      return result;
    } catch (error) {
      logger.error("Error deleting file from S3", {
        error: error.message,
        key,
      });
      throw new Error("Failed to delete file from S3");
    }
  }

  /**
   * Delete multiple files from S3
   * @param {Array<string>} keys - Array of S3 object keys
   * @returns {Promise<Object>} - Delete result
   */
  async deleteMultipleFiles(keys) {
    try {
      if (!keys || keys.length === 0) {
        return { Deleted: [] };
      }

      const command = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: false,
        },
      });

      const result = await this.s3Client.send(command);

      logger.info("Multiple files deleted successfully from S3", {
        deletedCount: result.Deleted.length,
        keys: keys,
      });

      return result;
    } catch (error) {
      logger.error("Error deleting multiple files from S3", {
        error: error.message,
        keys,
      });
      throw new Error("Failed to delete files from S3");
    }
  }

  /**
   * Check if a file exists in S3
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>} - Whether file exists
   */
  async fileExists(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (
        error.name === "NotFound" ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata from S3
   * @param {string} key - S3 object key
   * @returns {Promise<Object>} - File metadata
   */
  async getFileMetadata(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const result = await this.s3Client.send(command);

      return {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        etag: result.ETag,
      };
    } catch (error) {
      logger.error("Error getting file metadata", {
        error: error.message,
        key,
      });
      throw new Error("Failed to get file metadata");
    }
  }
}

module.exports = S3Service;
