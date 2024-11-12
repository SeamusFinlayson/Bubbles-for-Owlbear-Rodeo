import { getPluginId } from "@/getPluginId";
import { Metadata } from "@owlbear-rodeo/sdk";

export function getPluginMetadata(itemMetadata: Metadata, pluginId?: string) {
  const pluginMetadata = itemMetadata[
    pluginId ? pluginId : getPluginId("metadata")
  ] as Record<string, unknown>;
  return pluginMetadata;
}

export function readBooleanFromObject(
  object: unknown,
  key: string,
  fallback: boolean = false,
): boolean {
  const value = safeObjectRead(object, key);
  if (typeof value !== "boolean") return fallback;
  return value;
}

export function readNumberFromObject(
  object: unknown,
  key: string,
  fallback: number = 0,
): number {
  const value = safeObjectRead(object, key);
  if (typeof value !== "number") return fallback;
  if (Number.isNaN(value)) return fallback;
  return value;
}

export function safeObjectRead(object: unknown, key: string): unknown {
  try {
    const value = (object as Record<string, unknown>)[key];
    return value;
  } catch (error) {
    return undefined;
  }
}
