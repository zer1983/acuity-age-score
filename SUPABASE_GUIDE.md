# Supabase Integration Guide

This guide explains how to work with Supabase in this React TypeScript application.

## 🚀 Quick Start

### 1. Environment Setup
The application is already configured with your Supabase credentials in the `.env` file:

```env
VITE_SUPABASE_URL=https://gfpxywkejwmelesljhov.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Import the Supabase Client
```typescript
import { supabase } from '@/integrations/supabase/client';
```

### 3. Use Utility Functions
```typescript
import { supabaseUtils, assessmentUtils, profileUtils } from '@/lib/supabase-utils';
```

## 📊 Database Schema

Your Supabase database contains the following main tables:

### Tables
- **`profiles`** - User profiles
- **`assessments`** - Assessment records
- **`assessment_answers`** - Individual answers for each assessment
- **`Question`** - Assessment questions
- **`answer`** - Question answer options
- **`Category`** - Question categories
- **`Population`** - Population data

## 🔧 Common Operations

### Authentication
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, signIn, signUp, signOut } = useAuth();
```

### Basic CRUD Operations
```typescript
// Create
const { data, error } = await supabaseUtils.create('table_name', data);

// Read
const { data, error } = await supabaseUtils.read('table_name', filters);

// Update
const { data, error } = await supabaseUtils.update('table_name', id, updates);

// Delete
const { error } = await supabaseUtils.delete('table_name', id);
```

### Assessment Operations
```typescript
// Get user's assessments
const { data, error } = await assessmentUtils.getUserAssessments(userId);

// Get assessment with answers
const { data, error } = await assessmentUtils.getAssessmentWithAnswers(assessmentId);

// Save assessment with answers
const { data, error } = await assessmentUtils.saveAssessmentWithAnswers(assessmentData, answersData);
```

### Profile Operations
```typescript
// Get user profile
const { data, error } = await profileUtils.getUserProfile(userId);

// Update user profile
const { data, error } = await profileUtils.updateUserProfile(userId, updates);
```

## 🎯 Real-World Examples

### Example 1: Creating a New Assessment
```typescript
import { assessmentUtils } from '@/lib/supabase-utils';
import { useAuth } from '@/contexts/AuthContext';

const CreateAssessment = () => {
  const { user } = useAuth();

  const handleCreateAssessment = async () => {
    if (!user) return;

    const assessmentData = {
      user_id: user.id,
      patient_name: 'John Doe',
      patient_age: 30,
      patient_gender: 'male',
      total_score: 75,
      assessment_date: new Date().toISOString()
    };

    const answersData = [
      {
        question_id: 'q1',
        question_title: 'How are you feeling?',
        category: 'mood',
        selected_value: 'good',
        selected_label: 'Good',
        selected_score: 5
      }
    ];

    const { data, error } = await assessmentUtils.saveAssessmentWithAnswers(
      assessmentData, 
      answersData
    );

    if (error) {
      console.error('Failed to save:', error);
      return;
    }

    console.log('Assessment saved:', data);
  };

  return <button onClick={handleCreateAssessment}>Create Assessment</button>;
};
```

### Example 2: Fetching User Data
```typescript
import { useEffect, useState } from 'react';
import { assessmentUtils } from '@/lib/supabase-utils';
import { useAuth } from '@/contexts/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user) return;

      const { data, error } = await assessmentUtils.getUserAssessments(user.id);
      
      if (error) {
        console.error('Failed to fetch:', error);
        return;
      }

      setAssessments(data || []);
      setLoading(false);
    };

    fetchAssessments();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Your Assessments ({assessments.length})</h2>
      {assessments.map(assessment => (
        <div key={assessment.id}>
          <h3>{assessment.patient_name}</h3>
          <p>Score: {assessment.total_score}</p>
          <p>Date: {new Date(assessment.assessment_date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};
```

### Example 3: Pagination
```typescript
import { useState, useEffect } from 'react';
import { supabaseUtils } from '@/lib/supabase-utils';

const AssessmentList = () => {
  const [assessments, setAssessments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAssessments = async (pageNum: number) => {
    setLoading(true);
    
    const { data, count, error } = await supabaseUtils.paginate(
      'assessments',
      pageNum,
      10, // items per page
      { active: true },
      'AssessmentList'
    );

    if (error) {
      console.error('Failed to fetch:', error);
      return;
    }

    setAssessments(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssessments(page);
  }, [page]);

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {assessments.map(assessment => (
            <div key={assessment.id}>
              <h3>{assessment.patient_name}</h3>
              <p>Score: {assessment.total_score}</p>
            </div>
          ))}
          
          <div>
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

## 🛠️ Error Handling

The application includes centralized error handling:

```typescript
import { ErrorHandler } from '@/lib/error-handler';

// Handle errors automatically
const { data, error } = await supabaseUtils.create('table', data);

// Or handle manually
try {
  const { data, error } = await supabase.from('table').select('*');
  if (error) throw error;
} catch (error) {
  ErrorHandler.showToast(error, 'MyComponent');
}
```

## 🔍 Debugging

### Enable Debug Mode
Add to your `.env` file:
```env
VITE_ENABLE_DEBUG_MODE=true
```

### Check Network Tab
- Open browser DevTools
- Go to Network tab
- Look for requests to your Supabase URL
- Check for any failed requests

### Console Logging
```typescript
// Log Supabase client
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

// Log user session
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);
```

## 📝 Best Practices

1. **Always handle errors**: Use try-catch or check error responses
2. **Use TypeScript**: Leverage the generated types from Supabase
3. **Implement loading states**: Show loading indicators during async operations
4. **Validate data**: Check data before sending to Supabase
5. **Use transactions**: For operations that affect multiple tables
6. **Cache data**: Use React Query or similar for caching
7. **Secure your data**: Use Row Level Security (RLS) policies

## 🚨 Common Issues

### Issue: "Missing Supabase environment variables"
**Solution**: Check your `.env` file has the correct variables

### Issue: "Authentication required"
**Solution**: Ensure user is logged in before making authenticated requests

### Issue: "Network error"
**Solution**: Check your internet connection and Supabase URL

### Issue: "Permission denied"
**Solution**: Check your RLS policies and user permissions

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Types](https://supabase.com/docs/guides/api/typescript-support)

## 🆘 Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Verify your environment variables
3. Test your Supabase connection
4. Check the Supabase dashboard for any issues
5. Review the error handling in your code

The application is now fully configured to work with your Supabase backend. You can start building features using the provided utilities and examples!