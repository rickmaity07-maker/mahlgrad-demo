/** "?for=Burgerhaus Müller" turns the home page into a pitch for that restaurant. */
export function pitchName(raw: string | string[] | null | undefined) {
  if (typeof raw !== "string") return null;
  const name = raw
    .replace(/[^\p{L}\p{N} &'.-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
  return name.length >= 2 ? name : null;
}
