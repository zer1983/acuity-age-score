# User Management System Setup Guide

This guide explains how to set up and manage the new user system for the Patient Assessment Tool.

## Overview

The system now includes a comprehensive user management system with predefined users and role-based access control. All users are pre-created in the database with a default password and can access the system without signing up.

## Default Users

The system comes with the following predefined users:

### System Administrators
- **Email:** system.admin@hospital.com
- **Role:** System Administrator
- **Access:** Full system access, user management, system-wide settings

### Hospital Administrators
- **Email:** hospital.admin@hospital.com
- **Role:** Hospital Administrator
- **Access:** Hospital-wide management, unit management, user management

- **Email:** admin.icu@hospital.com
- **Role:** Hospital Administrator
- **Access:** ICU-specific hospital administration

- **Email:** admin.emergency@hospital.com
- **Role:** Hospital Administrator
- **Access:** Emergency Department administration

### Unit Administrators
- **Email:** unit.admin.icu@hospital.com
- **Role:** Unit Administrator
- **Access:** ICU unit management

- **Email:** unit.admin.cardio@hospital.com
- **Role:** Unit Administrator
- **Access:** Cardiology unit management

- **Email:** unit.admin.pediatrics@hospital.com
- **Role:** Unit Administrator
- **Access:** Pediatrics unit management

### Regular Users (Nurses, Doctors)
- **Email:** nurse.icu1@hospital.com, nurse.icu2@hospital.com
- **Role:** User
- **Access:** Assessment creation and management

- **Email:** nurse.emergency1@hospital.com, nurse.emergency2@hospital.com
- **Role:** User
- **Access:** Emergency department assessments

- **Email:** nurse.cardio1@hospital.com, nurse.cardio2@hospital.com
- **Role:** User
- **Access:** Cardiology assessments

- **Email:** nurse.pediatrics1@hospital.com, nurse.pediatrics2@hospital.com
- **Role:** User
- **Access:** Pediatrics assessments

- **Email:** doctor.icu@hospital.com, doctor.emergency@hospital.com, doctor.cardio@hospital.com, doctor.pediatrics@hospital.com
- **Role:** User
- **Access:** Medical assessments and reviews

## Default Password

**All users have the default password: `123123`**

## Role Hierarchy

1. **System Administrator** (Highest)
   - Full system access
   - User management
   - System-wide settings
   - All hospital and unit management

2. **Hospital Administrator**
   - Hospital-wide management
   - Unit management
   - User management (limited)
   - Assessment oversight

3. **Unit Administrator**
   - Unit-specific management
   - Room and bed management
   - Patient management
   - Assessment oversight within unit

4. **User** (Lowest)
   - Assessment creation and management
   - Patient data access
   - Basic reporting

## Database Setup

### 1. Run the Migration

The migration file `20250830000000_create_users_table.sql` will:
- Create the `users` table
- Insert all predefined users
- Set up authentication for all users
- Create triggers for automatic auth user creation
- Update role constraints

### 2. Verify Setup

After running the migration, verify that:
- All users are created in the `users` table
- Auth users are created in `auth.users` table
- Profiles are created in `profiles` table
- All users can log in with the default password

## Managing Users

### Adding New Users

1. **Via System Admin Dashboard:**
   - Log in as a System Administrator
   - Navigate to the System Administration dashboard
   - Click "Add User"
   - Fill in user details and assign role
   - The user will be created with default password "123123"

2. **Via Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to Table Editor
   - Select the `users` table
   - Insert a new row with user details
   - The trigger will automatically create auth user and profile

### Changing User Roles

1. **Via System Admin Dashboard:**
   - Edit user from the user management table
   - Change role in the dropdown
   - Save changes

2. **Via Supabase Dashboard:**
   - Update the `role` field in the `users` table
   - Update the corresponding `role` field in the `profiles` table

### Available Roles

- `user` - Regular user (nurses, doctors)
- `admin` - Unit Administrator
- `hospital_admin` - Hospital Administrator
- `system_admin` - System Administrator

## Security Considerations

### Password Management

1. **Default Password:** All users start with password "123123"
2. **Password Change:** Users should change their password on first login
3. **Password Policy:** Consider implementing password policies in Supabase

### Access Control

1. **Row Level Security (RLS):** Enabled on all tables
2. **Role-based Policies:** Users can only access data based on their role
3. **Authentication Required:** All routes require authentication

### Best Practices

1. **Regular Audits:** Review user access and roles regularly
2. **Principle of Least Privilege:** Assign minimum required permissions
3. **Monitor Activity:** Track user login and activity
4. **Backup Users:** Keep backup admin accounts

## Troubleshooting

### User Cannot Log In

1. **Check User Exists:**
   ```sql
   SELECT * FROM users WHERE email = 'user@hospital.com';
   ```

2. **Check Auth User:**
   ```sql
   SELECT * FROM auth.users WHERE email = 'user@hospital.com';
   ```

3. **Check Profile:**
   ```sql
   SELECT * FROM profiles WHERE email = 'user@hospital.com';
   ```

### Missing Permissions

1. **Verify Role Assignment:**
   ```sql
   SELECT u.email, u.role, p.role 
   FROM users u 
   JOIN profiles p ON u.id = p.user_id 
   WHERE u.email = 'user@hospital.com';
   ```

2. **Check RLS Policies:**
   - Ensure RLS is enabled on tables
   - Verify policies are correctly configured

### Sync Issues

If users are not syncing between tables:

```sql
-- Manually sync users
SELECT public.sync_users_with_auth();
```

## API Reference

### User Management Functions

```typescript
import { userManagement } from '@/lib/user-management';

// Get all users
const { data: users, error } = await userManagement.getAllUsers();

// Create user
const { data: newUser, error } = await userManagement.createUser({
  email: 'newuser@hospital.com',
  full_name: 'New User',
  role: 'user'
});

// Update user
const { data: updatedUser, error } = await userManagement.updateUser(userId, {
  role: 'admin'
});

// Delete user
const { error } = await userManagement.deleteUser(userId);
```

### Role Checking

```typescript
import { useUserRole } from '@/hooks/useUserRole';

const { 
  isSystemAdmin, 
  isHospitalAdmin, 
  isUnitAdmin, 
  canManageUsers,
  canManageUnits 
} = useUserRole();
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs for authentication errors
3. Verify database schema and policies
4. Contact system administrator for role changes