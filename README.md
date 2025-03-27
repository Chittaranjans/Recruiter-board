# Recruitment Tracking System

This is a modern recruitment tracking application built with Next.js that helps streamline the hiring process. The system provides comprehensive tools for managing candidate applications, interview scheduling, and hiring workflows.

## Features

- **Candidate Management**: Track and organize applicant information
- **Job Posting Management**: Create, edit, and manage job listings
- **Interview Scheduling**: Coordinate and schedule interviews with candidates
- **Application Tracking**: Monitor candidate progress through hiring stages
- **Dashboard & Analytics**: Visualize recruitment metrics and KPIs
- **User Role Management**: Different access levels for recruiters, hiring managers, and admins

## Tech Stack

- **Frontend**: Next.js, React
- **UI Components**: Shadcn-UI, Tailwind CSS
- **State Management**: React Context API
- **API Integration**: RESTful API for backend communication

## Application Screenshots

<div align="center">

### Authentication
<p>Modern authentication system with login and registration screens</p>
<img src="./public/screeshots/front-page.png" alt="Login Page" width="400" />
<img src="./public/screeshots/register.png" alt="Registration Page" width="400" />

<br><br>

### Dashboard & Job Management
<p>Comprehensive dashboard showing key metrics and the job creation interface</p>
<img src="./public/screeshots/dashborad.png" alt="Dashboard Overview" width="400" />
<img src="./public/screeshots/newjob.png" alt="Job Creation Form" width="400" />

<br><br>

### Candidate Pipeline
<p>Kanban board for candidate tracking and candidate creation form</p>
<img src="./public/screeshots/kanban2.png" alt="Candidate Pipeline View" width="400" />
<img src="./public/screeshots/newcandidate.png" alt="New Candidate Form" width="400" />

<br><br>

### Candidate Management
<p>Comprehensive candidate board and interview scheduling interface</p>
<img src="./public/screeshots/candidate-board.png" alt="Candidate Board" width="400" />
<img src="./public/screeshots/interviewpage.png" alt="Interview Scheduling" width="400" />

<br><br>

### Interview Process
<p>Interview dashboard and detailed interview view</p>
<img src="./public/screeshots/interview-dashboard.png" alt="Interview Dashboard" width="400" />
<img src="./public/screeshots/interviewID.png" alt="Interview Details" width="400" />

<br><br>

### Feedback System
<p>Interview feedback collection and review screens</p>
<img src="./public/screeshots/interviewFeedback.png" alt="Feedback Collection" width="400" />
<img src="./public/screeshots/interviewIDFeedback.png" alt="Feedback Review" width="400" />

<br><br>

### Workflow Management
<p>Candidate status tracking and workflow management</p>
<img src="./public/screeshots/candidate-status.png" alt="Candidate Status" width="400" />
<img src="./public/screeshots/kanban1.png" alt="Workflow Kanban" width="400" />

</div>

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
src
├── components/       # Reusable UI components
├── app/              # App router pages and layouts
├── lib/              # Utility functions and shared logic
├── context/          # Auth-context management
└── types/            # Types Management 
```

## Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```
API_URL=your_backend_api_url
```

## Deployment

Follow the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for hosting options.

## Contributing

Please read the contribution guidelines before submitting pull requests.