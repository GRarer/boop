// utilities for working with angular

import { AbstractControl, FormGroup, ValidatorFn } from "@angular/forms";

// validator used on the "confirm password" control
// requires that control in a formgroup must have a value equal to a specific sibling control's value
export function equalToSiblingValidator(siblingName: string): ValidatorFn {
  return (c: AbstractControl) => {
    const parent = c.parent;
    if (!(parent instanceof FormGroup)) {
      return { parentControlMissing: true };
    }
    const sibling: AbstractControl | undefined = parent.controls[siblingName];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (sibling === undefined) {
      return { siblingControlMissing: true };
    }
    if (c.value !== sibling.value) {
      return { passwordMismatch: true };
    } else {
      return null;
    }
  };
}
