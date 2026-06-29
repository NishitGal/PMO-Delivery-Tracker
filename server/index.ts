import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- Projects API ---

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: true,
        raidLogs: true,
      },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: true,
        raidLogs: true,
      },
    });
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// --- Tasks API ---

app.post('/api/tasks', async (req, res) => {
  try {
    const { projectId, title, description, plannedStart, plannedEnd, isMilestone } = req.body;
    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        plannedStart: new Date(plannedStart),
        plannedEnd: new Date(plannedEnd),
        isMilestone: isMilestone || false,
      },
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// --- RAID Log API ---

app.get('/api/raid', async (req, res) => {
  try {
    const raidLogs = await prisma.raidLog.findMany();
    res.json(raidLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch RAID logs' });
  }
});

app.post('/api/raid', async (req, res) => {
  try {
    const { projectId, type, description, severity, owner } = req.body;
    const raidLog = await prisma.raidLog.create({
      data: {
        projectId,
        type,
        description,
        severity,
        owner,
      },
    });
    
    // Simple Automated Escalation Workflow
    if (severity === 'CRITICAL') {
       console.log(`[ESCALATION TRIGGERED] Critical ${type} added for project ${projectId}. Escalating to PMO Director...`);
       // In a real scenario, this would send an email or Slack message
    }

    res.json(raidLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create RAID log' });
  }
});

// --- PDF Report API ---

app.get('/api/reports/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        raidLogs: true,
      },
    });

    if (!project) return res.status(404).json({ error: 'Not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=status_report_${project.name}.pdf`);
    doc.pipe(res);

    doc.fontSize(25).text(`Weekly Status Report`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Project: ${project.name}`);
    doc.fontSize(14).text(`Status: ${project.status}`);
    doc.text(`Dates: ${project.startDate.toDateString()} - ${project.endDate.toDateString()}`);
    doc.moveDown();

    doc.fontSize(16).text(`Critical RAID Items:`, { underline: true });
    project.raidLogs.filter(r => r.severity === 'CRITICAL' || r.severity === 'HIGH').forEach(r => {
      doc.fontSize(12).text(`- [${r.type}] ${r.severity}: ${r.description} (Owner: ${r.owner || 'Unassigned'})`);
    });
    doc.moveDown();

    doc.fontSize(16).text(`Milestones Overview:`, { underline: true });
    project.tasks.filter(t => t.isMilestone).forEach(t => {
      doc.fontSize(12).text(`- ${t.title} (${t.status}) - Due: ${t.plannedEnd.toDateString()}`);
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
