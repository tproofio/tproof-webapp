import {Upload} from "@aws-sdk/lib-storage";
import {S3Client} from "@aws-sdk/client-s3";
import {XhrHttpHandler} from "@aws-sdk/xhr-http-handler";
import {AWS_S3_KEY_ID, AWS_S3_PRIVATE_KEY} from "../constants";

export default class S3Manager {

  /**
   *
   * @return {Promise<S3Client>}
   */
  static createS3Client = async () => {
    return new S3Client({
      apiVersion: '2012-08-10',
      credentials: {
        accessKeyId: AWS_S3_KEY_ID,
        secretAccessKey: AWS_S3_PRIVATE_KEY
      },
      region: "eu-west-1",
      requestHandler: new XhrHttpHandler({})
    });
  }

  /**
   *
   * @param {string} bucket
   * @param {string} key
   * @param {File} body
   * @param {Object} [metadata={}] - metadata in key-value format to be assigned to the uploaded object
   * @return {Promise<Upload>}
   */
  static createS3ManagedUpload = async (bucket, key, body, metadata={}) => {
    return new Upload({
      client: await S3Manager.createS3Client(),
      params: {Bucket: bucket, Key: key, Body: body, Metadata: metadata}
    });
  }

}
