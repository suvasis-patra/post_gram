class ApiError extends Error {
  statusCode: number;
  message: string;
  data: any;
  errors: any[];
  success: boolean;
  constructor(
    statusCode: number,
    message = "something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    (this.statusCode = statusCode),
      (this.data = null),
      (this.message = message),
      (this.success = false),
      (this.errors = errors);
  }
}

export { ApiError };
