# Career Compass AI

AI Career Guidance & Counseling Lead Engine

Build a complete production-ready web application called AI Career Guidance & Counseling Platform.

Objective

Create an AI-powered career guidance system that helps students discover suitable career paths, identify skill gaps, receive degree recommendations, get university suggestions, and receive a personalized action plan.

The platform should also function as a lead-generation and counseling system by identifying students interested in higher education and storing them as qualified leads.

Technology Stack

Frontend: React + TypeScript

UI: Modern Glassmorphism Design

Backend: Supabase

Database: PostgreSQL (Supabase)

Authentication: Supabase Auth

AI Integration: OpenAI GPT API or Gemini API

State Management: React Context

Charts: Recharts

PDF Generation: jsPDF

Responsive Design: Mobile + Desktop

Landing Page

Create a professional landing page containing:

Hero Section

Title:
"Discover Your Ideal Career Path with AI"

Subtitle:
"Get personalized career guidance, degree recommendations, skill roadmaps, and higher education counseling."

Buttons:

Start Assessment

Learn More

Features Section

Cards:

AI Career Analysis

Skill Gap Assessment

Degree Recommendations

University Suggestions

Personalized Career Roadmap

Counseling Support

How It Works

Step 1:
Complete Assessment

Step 2:
AI Analyzes Profile

Step 3:
Receive Career Report

Step 4:
Connect with Counselors

Student Assessment Flow

Create a multi-step form with progress tracking.

Step 1: Personal Information

Fields:

Full Name

Email

Phone Number

City

State

Validation:
Required fields

Step 2: Education Details

Fields:

Current Education

Degree/Course

College/University

Current Year/Semester

CGPA/Percentage

Step 3: Skills Assessment

Multi-select chips:

Programming

Communication

Leadership

Data Analysis

Design

Marketing

Problem Solving

AI/ML

Web Development

Cybersecurity

Allow custom skills.

Step 4: Interests

Multi-select:

Artificial Intelligence

Software Development

Data Science

Cybersecurity

Cloud Computing

Business

Finance

Marketing

UI/UX Design

Entrepreneurship

Step 5: Career Goals

Questions:

What is your dream career?

Preferred job role?

Preferred industry?

Preferred work location?

Expected salary range?

Step 6: Higher Education Preferences

Question:

How are you planning to pursue your next degree?

Options:

Online Degree

Offline Degree

Hybrid

Distance Learning

Not Sure Yet

Question:

Would you like help choosing the right degree, university, or specialization?

Options:

Yes, I want counseling

Yes, I want more information

Maybe, I'm exploring options

No, I just want career guidance

Question:

Preferred Budget

Below ₹1 Lakh

₹1-3 Lakhs

₹3-5 Lakhs

₹5+ Lakhs

Database Schema

Create Supabase tables.

students

id UUID
name
email
phone
city
state
education
course
college
year
skills JSON
interests JSON
career_goals
created_at

leads

id UUID
student_id
name
email
phone
degree_mode
counseling_required
lead_type
specialization
created_at

ai_reports

id UUID
student_id
career_paths JSON
skills_recommendation JSON
degree_recommendation JSON
university_recommendation JSON
short_term_plan TEXT
long_term_plan TEXT
overall_recommendation TEXT
created_at

Lead Qualification Logic

Automatically classify leads.

Rules:

IF degree mode is:

Online Degree
OR

Distance Learning

OR counseling response is:

Yes, I want counseling

Yes, I want more information

THEN:

Create lead entry.

Lead Types:

Career Guidance Only

Degree Explorer

Counseling Interested

Online Degree Lead

Offline Degree Lead

Hybrid Degree Lead

Undecided

Prevent duplicate leads.

AI System

Create separate AI functions.

Function 1: Profile Analysis

Analyze:

Education

Skills

Interests

Goals

Return:

Strengths

Weaknesses

Opportunities

Function 2: Career Recommendation

Recommend 5 careers.

For each career provide:

Career Name

Match Percentage

Why Suitable

Growth Potential

Expected Salary

Job Roles

Function 3: Skill Recommendation

Identify:

Missing Skills

Priority Skills

Recommended Learning Path

Provide:

Beginner
Intermediate
Advanced roadmap

Function 4: Degree Recommendation

Suggest:

Degree Programs

Specializations

Study Modes

Explain why each degree fits.

Function 5: University Recommendation

Recommend universities based on:

Budget

Location

Specialization

Degree Type

Separate:

AI Suggestions

Verified Institution Information

Function 6: Action Plan

Generate:

Short-Term Plan (3-6 Months)

Skills to Learn

Projects to Build

Resume Improvements

Internship Preparation

Long-Term Plan (1-3 Years)

Degree Path

Certifications

Career Progression

Higher Education Goals

Career Report Dashboard

Create a modern dashboard displaying:

Career Profile

Strengths
Interests
Goals

Recommended Career Paths

Display cards with:

Match %

Description

Job Roles

Skills to Learn

Priority order

Degree Recommendations

Cards with:

Degree Name

Specialization

Duration

University Suggestions

Table View

Action Plan

Timeline View

Overall AI Recommendation

Highlight section

Additional Features

Download PDF Career Report

Email Report

Dark Mode

Student Dashboard

Progress Tracker

Career Match Score

AI Chat Assistant

Analytics Dashboard

Lead Management Panel

Admin Dashboard

Admin Dashboard

Create protected admin section.

Features:

Total Students

Total Leads

Conversion Rate

Lead Classification Chart

Recent Assessments

Search Students

Export CSV

Export Leads

UI Requirements

Premium Modern Design

Glassmorphism

Smooth Animations

Mobile Responsive

Progress Indicators

Beautiful Charts

Professional Color Palette

Fast Loading

Deliverables

Generate:

Complete UI

Supabase Integration

Database Tables

API Functions

AI Prompt Structure

Lead Engine

Career Report Dashboard

Admin Dashboard

Production Ready Code

The application should feel like a real EdTech startup product and not a simple chatbot.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ai-pathfinder-pro-50.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ac56b8d6-bdf7-4381-b184-43a6baaf553e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
