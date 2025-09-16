# 🎯 HOW LEARNERS PICK COURSES TO RATE - STEP BY STEP

## 📚 STEP 1: LEARNER BROWSES COURSES
```
Learner goes to: http://localhost:5173/learner/courses
↓
Learner sees list of all available courses
↓
Each course shows:
- Course title
- Tutor name  
- Star rating (if any reviews exist)
- Price
- "Enroll Now" button
```

## 🔍 STEP 2: LEARNER CLICKS ON A COURSE
```
Learner clicks on any course card
↓
Learner goes to: http://localhost:5173/learner/courses/[courseId]
↓
This is the Course Detail page
```

## 📖 STEP 3: LEARNER VIEWS COURSE DETAILS
```
Course Detail page shows:
- Course overview
- Course content
- Tutor information
- Live classes
- Reviews tab
```

## ⭐ STEP 4: LEARNER GOES TO REVIEWS TAB
```
Learner clicks on "Reviews" tab
↓
Learner sees:
- Existing reviews from other learners
- Course rating statistics
- "Write a Review" button (if they haven't reviewed yet)
```

## ✍️ STEP 5: LEARNER CLICKS "WRITE A REVIEW"
```
Learner clicks "Write a Review" button
↓
Review form appears with:
- 5-star rating selector
- Review title field
- Detailed review text area
- Overall experience (Positive/Neutral/Negative)
- Submit button
```

## 📝 STEP 6: LEARNER FILLS OUT REVIEW
```
Learner fills out:
- ⭐⭐⭐⭐⭐ (clicks stars)
- Title: "Great course!"
- Review: "The tutor explains everything clearly"
- Experience: Positive
↓
Learner clicks "Submit Review"
```

## 🔔 STEP 7: NOTIFICATIONS SENT
```
✅ Tutor gets notified: "John reviewed your course with 5 stars"
✅ Admin gets notified: "John reviewed Sarah's course with 5 stars"  
✅ Learner gets notified: "Your review is pending approval"
```

## ✅ STEP 8: ADMIN APPROVES REVIEW
```
Admin goes to admin dashboard
Admin sees pending review
Admin clicks "Approve"
↓
✅ Learner gets notified: "Your review was approved!"
✅ Review goes live for other learners to see
```

## 🎯 KEY POINTS:

### WHO CAN RATE:
- ✅ **Only enrolled learners** can rate courses
- ✅ **Only after completing** the course
- ✅ **One review per course** per learner

### WHERE TO RATE:
1. **Course List Page**: `http://localhost:5173/learner/courses`
2. **Course Detail Page**: `http://localhost:5173/learner/courses/[courseId]`
3. **Reviews Tab**: Click "Reviews" tab on course detail page
4. **Write Review Button**: Click "Write a Review" button

### WHAT HAPPENS:
1. **Learner submits review** → Goes to admin for approval
2. **Tutor gets notified** → Knows someone reviewed their course
3. **Admin gets notified** → Can monitor tutor performance
4. **Admin approves review** → Review becomes visible to everyone
5. **Course rating updates** → Shows new average rating

## 🔍 VISUAL FLOW:

```
Course List Page
       ↓
   Click Course
       ↓
Course Detail Page
       ↓
   Click "Reviews" Tab
       ↓
   Click "Write a Review"
       ↓
   Fill Review Form
       ↓
   Click "Submit"
       ↓
   Admin Approves
       ↓
   Review Goes Live
```

## 🎉 SUMMARY:

**Learners pick courses to rate by:**
1. **Browsing** the course list
2. **Clicking** on a course they want to review
3. **Going** to the Reviews tab
4. **Clicking** "Write a Review" button
5. **Filling out** the review form
6. **Submitting** their review

**The system ensures:**
- Only enrolled learners can rate
- All reviews are moderated by admin
- Tutors get notified of feedback
- Admins can monitor performance
- Other learners can see helpful reviews
