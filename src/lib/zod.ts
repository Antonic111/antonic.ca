import { z } from "zod";

export const blockTypes = [
  "TEXT",
  "HEADING",
  "IMAGE",
  "BUTTON",
  "ICON_BUTTON",
  "SOCIAL_LINK",
  "LINK_CARD",
  "DIVIDER",
  "SPACER",
  "LOCATION",
] as const;

export const sectionTypes = [
  "HERO_PROFILE",
  "BANNER",
  "AVATAR",
  "HEADING",
  "TEXT",
  "RICH_TEXT",
  "SOCIAL_ICON_ROW",
  "LINK_CARDS",
  "BUTTON_ROW",
  "IMAGE",
  "DIVIDER",
  "SPACER",
  "TWO_COLUMN",
  "GRID",
  "SUPPORT_LINKS",
  "EXTERNAL_WEBSITE_CARD",
  "PROFILE",
  "LINKS",
  "STANDARD",
  "FOURTHWALL_MERCH"
] as const;

// Base validation for all style JSONs to prevent arbitrary CSS injection
export const baseStyleSchema = z.object({
  paddingTop: z.number().min(0).max(256).optional(),
  paddingBottom: z.number().min(0).max(256).optional(),
  paddingX: z.number().min(0).max(256).optional(),
  paddingY: z.number().min(0).max(256).optional(),
  marginTop: z.number().min(-256).max(256).optional(),
  marginBottom: z.number().min(-256).max(256).optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().min(0).max(32).optional(),
  borderRadius: z.union([z.number(), z.string()]).optional(),
  fontSize: z.number().min(8).max(128).optional(),
  fontWeight: z.enum(["normal", "medium", "semibold", "bold", "extrabold"]).optional(),
  fontFamily: z.string().optional(),
  fullWidth: z.boolean().optional(),
  width: z.union([z.number(), z.string()]).optional(),
  height: z.union([z.number(), z.string()]).optional(),
  iconSize: z.number().optional(),
  iconRadius: z.number().optional(),
  objectPosition: z.enum(["top", "bottom", "left", "right", "center", ""]).optional(),
  cropTop: z.number().min(0).max(100).optional(),
  cropBottom: z.number().min(0).max(100).optional(),
  cropLeft: z.number().min(0).max(100).optional(),
  cropRight: z.number().min(0).max(100).optional(),
  backgroundOverlap: z.boolean().optional(),
  backgroundContain: z.boolean().optional(),
  edgeBlurTop: z.number().min(0).max(50).optional(),
  edgeBlurBottom: z.number().min(0).max(50).optional(),
  edgeBlurLeft: z.number().min(0).max(50).optional(),
  edgeBlurRight: z.number().min(0).max(50).optional(),
  imagePulse: z.boolean().optional(),
  pulseColor: z.string().optional(),
});

export const blockContentSchema = z.object({
  text: z.string().optional(),
  url: z.string().optional(),
  altText: z.string().optional(),
  icon: z.string().optional(),
  iconUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  level: z.number().min(1).max(6).optional(), // For headings
  target: z.enum(["_self", "_blank"]).optional(),
  platform: z.string().optional(), // For social
  subtitle: z.string().optional(), // For link cards
  buttonType: z.string().optional(), // For buttons: 'link' or 'email'
  email: z.string().optional(), // For email reveal
});

export const pageBlockSchema = z.object({
  id: z.string().optional(),
  type: z.enum(blockTypes),
  order: z.number().int().min(0),
  visible: z.boolean().default(true),
  contentJson: blockContentSchema,
  styleJson: baseStyleSchema,
});

export const sectionSettingsSchema = baseStyleSchema.extend({
  fullWidth: z.boolean().optional(),
  maxWidth: z.number().min(300).max(2000).optional(),
  columns: z.number().min(1).max(4).optional(),
  gap: z.number().min(0).max(100).optional(),
  alignItems: z.enum(["start", "center", "end"]).optional(),
  arrowSize: z.number().min(10).max(64).optional(),
  arrowThickness: z.number().min(1).max(5).optional(),
  cardBgColor: z.string().optional(),
  cardTextColor: z.string().optional(),
  discordBadgeSize: z.number().min(10).max(40).optional(),
  discordBadgeColor: z.string().optional(),
  discordBadgeBgColor: z.string().optional(),
});

export const pageSectionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(sectionTypes),
  order: z.number().int().min(0),
  visible: z.boolean().default(true),
  settingsJson: sectionSettingsSchema,
  blocks: z.array(pageBlockSchema).optional(),
});

export const pageSettingsSchema = z.object({
  globalMaxWidth: z.number().optional(),
  globalBackgroundColor: z.string().optional(),
});

export const saveDraftSchema = z.object({
  pageId: z.string().cuid(),
  settingsJson: pageSettingsSchema.optional(),
  sections: z.array(pageSectionSchema),
});
