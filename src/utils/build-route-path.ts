export function buildRoutePath(path: string) {
  const paramNameRegex = /:([a-zA-Z]+)/g;
  const paramValueReplace = `(?<$1>[\\w\\-]+)`;
  const pathWithParams = path.replaceAll(paramNameRegex, paramValueReplace);
  const queryParams = `(?<queryParams>\\?(.*))?$`;

  return new RegExp(`^${pathWithParams}${queryParams}`);
}
