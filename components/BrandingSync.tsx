"use client";

import { useEffect } from "react";

const replacements: Array<[RegExp, string]> = [
  [/FUTAGO/g, "DoniVerse"],
  [/Know where to go\./g, "Your whole campus world, in one place."],
];

function replaceText(value: string) {
  return replacements.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value);
}

function updateNode(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    const textNode = root as Text;
    const current = textNode.nodeValue ?? "";
    const next = replaceText(current);
    if (next !== current) textNode.nodeValue = next;
    return;
  }

  if (!(root instanceof Element)) return;
  if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(root.tagName)) return;

  for (const attribute of ["aria-label", "title", "placeholder"]) {
    const current = root.getAttribute(attribute);
    if (!current) continue;
    const next = replaceText(current);
    if (next !== current) root.setAttribute(attribute, next);
  }

  root.childNodes.forEach(updateNode);
}

export default function BrandingSync() {
  useEffect(() => {
    const applyBranding = () => {
      document.title = replaceText(document.title);
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
