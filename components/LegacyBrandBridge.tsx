"use client";

import { useEffect } from "react";
import {
  DONIVERSE_NAME,
  DONIVERSE_TAGLINE,
  LEGACY_BRAND_NAME,
  LEGACY_BRAND_TAGLINE,
} from "@/lib/brand";

function replaceLegacyBrand(value: string) {
  return value
    .replaceAll(LEGACY_BRAND_NAME, DONIVERSE_NAME)
    .replaceAll(LEGACY_BRAND_TAGLINE, DONIVERSE_TAGLINE);
}

function updateNode(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    const textNode = root as Text;
    const current = textNode.nodeValue ?? "";
    const next = replaceLegacyBrand(current);
    if (next !== current) textNode.nodeValue = next;
    return;
  }

  if (!(root instanceof Element)) return;
  if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(root.tagName)) return;

  for (const attribute of ["aria-label", "title", "placeholder"]) {
    const current = root.getAttribute(attribute);
    if (!current) continue;
    const next = replaceLegacyBrand(current);
    if (next !== current) root.setAttribute(attribute, next);
  }

  root.childNodes.forEach(updateNode);
}

export default function LegacyBrandBridge() {
  useEffect(() => {
    const applyBranding = () => {
      document.title = replaceLegacyBrand(document.title);
      updateNode(document.body);
    };

    applyBranding();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(updateNode);
        if (mutation.type === "characterData") updateNode(mutation.target);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
