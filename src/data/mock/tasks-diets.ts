// Tasks and diet plans mock data

interface Task {
  id: string
  patient_id: string
  title: string
  description: string | null
  type: string
  status: string
  due_date: string
  completed_at: string | null
  ignored_at: string | null
  created_at: string
  updated_at: string | null
}

export const mockTasks: Task[] = [
  {
    id: "task-001",
    patient_id: "patient-001",
    title: "Follow-up Blood Pressure Check",
    description: "Schedule appointment to monitor blood pressure after medication adjustment",
    type: "follow_up",
    status: "pending",
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    completed_at: null,
    ignored_at: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
  {
    id: "task-002",
    patient_id: "patient-002",
    title: "HbA1c Test",
    description: "Order HbA1c test to monitor diabetes control",
    type: "lab_test",
    status: "pending",
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    completed_at: null,
    ignored_at: null,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
  {
    id: "task-003",
    patient_id: "patient-002",
    title: "Diet Plan Review",
    description: "Review and update meal plan based on recent weight loss progress",
    type: "diet_review",
    status: "completed",
    due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ignored_at: null,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-004",
    patient_id: "patient-003",
    title: "Thyroid Function Test",
    description: "Check TSH, T3, T4 levels",
    type: "lab_test",
    status: "pending",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    completed_at: null,
    ignored_at: null,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
]

interface PatientDiet {
  id: string
  patient_id: string
  diet_plan: string
  created_at: string
  updated_at: string
  version: number
  is_active: boolean
}

export const mockPatientDiets: PatientDiet[] = [
  {
    id: "diet-001",
    patient_id: "patient-002",
    diet_plan: `# Diabetes Management Diet Plan

## Daily Targets
- Calories: 1800-2000 kcal
- Carbohydrates: 180-200g (distributed throughout the day)
- Protein: 80-100g
- Fats: 50-60g (focus on healthy fats)

## Meal Structure

### Breakfast (7:00 AM)
- 2 boiled eggs
- 2 slices whole grain toast
- 1 cup green tea
- Small apple

### Mid-Morning Snack (10:00 AM)
- Handful of almonds (10-12 pieces)
- Small orange

### Lunch (1:00 PM)
- Grilled chicken breast (150g)
- Large mixed salad with olive oil dressing
- 1/2 cup brown rice
- Steamed vegetables

### Afternoon Snack (4:00 PM)
- Greek yogurt (low-fat)
- 1 tablespoon chia seeds

### Dinner (7:00 PM)
- Grilled fish (150g)
- Roasted vegetables
- Small portion quinoa
- Green salad

## Guidelines
- Drink 8-10 glasses of water daily
- Avoid sugary drinks and processed foods
- Monitor blood glucose before and after meals
- Exercise 30 minutes daily after meals`,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    version: 2,
    is_active: true,
  },
  {
    id: "diet-002",
    patient_id: "patient-005",
    diet_plan: `# GERD Management Diet Plan

## Foods to Avoid
- Spicy foods
- Citrus fruits
- Tomato-based products
- Chocolate
- Caffeine
- Carbonated drinks
- Fried and fatty foods

## Recommended Foods

### Breakfast
- Oatmeal with banana
- Whole grain toast
- Herbal tea

### Lunch
- Baked chicken or turkey
- Steamed vegetables
- Brown rice or quinoa
- Green salad (no vinegar dressing)

### Dinner (Early - by 6:00 PM)
- Lean protein (fish/chicken)
- Steamed vegetables
- Small portion of pasta or rice

## Eating Guidelines
- Eat smaller, frequent meals
- Avoid eating 2-3 hours before bedtime
- Chew food thoroughly
- Stay upright after meals
- Keep a food diary to identify triggers`,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    version: 1,
    is_active: true,
  },
]

// Lab Files
interface LabFile {
  id: string
  filename: string
  original_filename: string
  file_size: number
  mime_type: string
  blob_url: string | null
  uploaded_at: string
  patient_id: string
}

