import { Response } from "../config/http";

export type Schema = Record<string, [string] | [string, "required"]>;

export function validate(
  schema: Schema,
  data: Record<string, any>,
  res: Response
) {
  const [fieldNotAllowed] = Object.keys(data).filter(receivedKey => {
    return !Object.keys(schema).includes(receivedKey);
  });

  if (fieldNotAllowed)
    return !res.badRequest(`The field '${fieldNotAllowed}' is not allowed'`);

  const [emptyField] = Object.keys(schema).filter(expectedKey => {
    return schema[expectedKey][1] && !Object.keys(data).includes(expectedKey);
  });

  if (emptyField)
    return !res.badRequest(`The field '${emptyField}' is required'`);

  const [invalidField] = Object.keys(data).filter(receivedKey => {
    return typeof data[receivedKey] !== schema[receivedKey][0];
  });

  if (invalidField)
    return !res.badRequest(
      `The field '${invalidField}' must be ${schema[invalidField][0]}'`
    );

  return true;
}
