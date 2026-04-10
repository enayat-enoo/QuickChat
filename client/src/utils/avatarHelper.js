
export function getAvatar(avatar, name = "User") {
  if (avatar && avatar.trim() !== "") return avatar;

  const encoded = encodeURIComponent(name.trim() || "User");
  return `https://ui-avatars.com/api/?name=${encoded}&background=3c2a55&color=ffffff&size=128&bold=true`;
}