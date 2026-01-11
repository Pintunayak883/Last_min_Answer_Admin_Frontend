export interface ApiSuccess<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
