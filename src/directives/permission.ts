import type { App, Directive } from 'vue';
import {
  hasPermission,
  type PermissionMode,
  type PermissionValue
} from '@/utils/permission';

type PermissionDirectiveEffect = 'remove' | 'hide' | 'disable';

interface PermissionDirectiveOptions {
  permissions: PermissionValue;
  mode?: PermissionMode;
  effect?: PermissionDirectiveEffect;
}

type PermissionDirectiveBinding = PermissionValue | PermissionDirectiveOptions;

interface PermissionManagedElement extends HTMLElement {
  __permissionDisplay?: string;
  __permissionPointerEvents?: string;
  __permissionOpacity?: string;
  __permissionAriaDisabled?: string | null;
  __permissionDisabled?: boolean;
}

const permissionDirective: Directive<HTMLElement, PermissionDirectiveBinding> = {
  mounted(el, binding) {
    applyPermission(el as PermissionManagedElement, binding.value);
  },
  updated(el, binding) {
    applyPermission(el as PermissionManagedElement, binding.value);
  }
};

function applyPermission(
  el: PermissionManagedElement,
  value: PermissionDirectiveBinding
) {
  const options = normalizeDirectiveValue(value);

  if (!options)
    return;

  const allowed = hasPermission(options.permissions, {
    mode: options.mode
  });

  if (allowed) {
    restoreHiddenState(el);
    restoreDisabledState(el);
    return;
  }

  if (options.effect === 'hide') {
    hideElement(el);
    restoreDisabledState(el);
    return;
  }

  if (options.effect === 'disable') {
    restoreHiddenState(el);
    disableElement(el);
    return;
  }

  el.remove();
}

function normalizeDirectiveValue(
  value: PermissionDirectiveBinding
): PermissionDirectiveOptions | null {
  if (typeof value === 'string' || Array.isArray(value)) {
    return {
      permissions: value,
      effect: 'remove'
    };
  }

  if (!value || typeof value !== 'object' || !('permissions' in value)) {
    return null;
  }

  return {
    effect: 'remove',
    ...value
  };
}

function hideElement(el: PermissionManagedElement) {
  if (el.__permissionDisplay === undefined) {
    el.__permissionDisplay = el.style.display;
  }

  el.style.display = 'none';
}

function restoreHiddenState(el: PermissionManagedElement) {
  if (el.__permissionDisplay !== undefined) {
    el.style.display = el.__permissionDisplay;
  }
}

function disableElement(el: PermissionManagedElement) {
  if (el.__permissionPointerEvents === undefined) {
    el.__permissionPointerEvents = el.style.pointerEvents;
  }

  if (el.__permissionOpacity === undefined) {
    el.__permissionOpacity = el.style.opacity;
  }

  if (el.__permissionAriaDisabled === undefined) {
    el.__permissionAriaDisabled = el.getAttribute('aria-disabled');
  }

  if ('disabled' in el && el.__permissionDisabled === undefined) {
    el.__permissionDisabled = Boolean((el as HTMLButtonElement).disabled);
  }

  if ('disabled' in el) {
    (el as HTMLButtonElement).disabled = true;
  }

  el.style.pointerEvents = 'none';
  el.style.opacity = '0.5';
  el.setAttribute('aria-disabled', 'true');
}

function restoreDisabledState(el: PermissionManagedElement) {
  if ('disabled' in el && el.__permissionDisabled !== undefined) {
    (el as HTMLButtonElement).disabled = el.__permissionDisabled;
  }

  if (el.__permissionPointerEvents !== undefined) {
    el.style.pointerEvents = el.__permissionPointerEvents;
  }

  if (el.__permissionOpacity !== undefined) {
    el.style.opacity = el.__permissionOpacity;
  }

  if (el.__permissionAriaDisabled === null) {
    el.removeAttribute('aria-disabled');
  }
  else if (el.__permissionAriaDisabled !== undefined) {
    el.setAttribute('aria-disabled', el.__permissionAriaDisabled);
  }
}

export function registerPermissionDirective(app: App<Element>) {
  app.directive('permission', permissionDirective);
}
