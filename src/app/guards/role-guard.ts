import { CanActivateFn, Router } from '@angular/router';

import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route, state) => {

    const router = inject(Router);

    const role = localStorage.getItem('role');

    const allowedRoles = route.data['roles'] as string[] | undefined;

    if (role && allowedRoles?.includes(role)) {

        return true;

    }

    router.navigate(['/dashboard']);

    return false;

};