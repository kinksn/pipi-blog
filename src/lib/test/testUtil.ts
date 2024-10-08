type RequestBody = Record<string, any>;

export const createGETRequest = (endpoint: string) => {
  return new Request(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    method: "GET",
  });
};

export const createPOSTRequest = (body: RequestBody, endpoint: string) => {
  return new Request(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const createPATCHRequest = (body: RequestBody, endpoint: string) => {
  return new Request(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
};

export const createDELETERequest = (endpoint: string, body?: RequestBody) => {
  return new Request(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    method: "DELETE",
    ...(body && { body: JSON.stringify(body) }),
  });
};
