const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ 
  size: 'LETTER',
  margins: { top: 50, bottom: 50, left: 50, right: 50 }
});

const outputPath = path.join(__dirname, '..', 'public', 'Allegacy-Impact-Ecosystem-Presentation.pdf');
doc.pipe(fs.createWriteStream(outputPath));

const navy = '#003366';
const blue = '#005599';
const amber = '#f59e0b';
const gray = '#374151';
const lightGray = '#6b7280';

const slides = [
  {
    number: 1,
    title: "The Allegacy Impact Ecosystem",
    subtitle: "Leveraging Strategic Pipelines for Regional Dominance",
    presenter: "Presented by: Tavores Vanhook",
    points: [],
    image: "professional_busines_b056ce0d.jpg",
    script: "Good morning/afternoon. Most plans for community engagement focus on being present. My plan is about being essential. I'm here today as a founder and a Business Development Manager to show you how I will anchor Allegacy into the fabric of the Palladium region by leveraging pipelines I have already built and proven."
  },
  {
    number: 2,
    title: "Regional Opportunities - The Growth Corridor",
    subtitle: "Mapping the Transition Zones",
    points: [
      { label: "Palladium Hub", text: "High-density professional and residential growth" },
      { label: "The 'Transition' Segment", text: "Students and GHA participants moving into first-time financial milestones" },
      { label: "Key Institutions", text: "Eastern Guilford, NC A&T, UNCG" }
    ],
    image: "affordable_housing_c_ff2431ac.jpg",
    script: "The growth in this region is found in the 'Transition Zones.' We are looking at thousands of residents at the Greensboro Housing Authority and students at NC A&T and UNCG who are moving toward their first major financial milestones. My approach is to meet them at the point of decision, making Allegacy the undisputed choice for their financial future."
  },
  {
    number: 3,
    title: "Priority 1 - The 'Wealth Engine'",
    subtitle: "GHA & Claremont Courts Partnership",
    points: [
      { label: "Frequency", text: "Bi-weekly presence at Claremont Courts meetings" },
      { label: "Innovation", text: "The 'Savings-to-Legacy' High-Yield CD Program" },
      { label: "The Result", text: "Direct membership growth and 'sticky' deposits" }
    ],
    image: "professional_diverse_3ddbffc1.jpg",
    script: "My first priority is the GHA. I don't just have a contact there; I have a seat at the table. At Revity, I helped engineer a High-Yield CD savings plan for FSS participants. I will bring that same intensity to Allegacy. By being present bi-weekly at Claremont Courts, we capture the escrowed savings of the program and create a direct pipeline for first-time homebuyer loans."
  },
  {
    number: 4,
    title: "Priority 2 - The 'University Hub'",
    subtitle: "NC A&T and UNCG Strategic Pipeline",
    points: [
      { label: "Target Audience", text: "Students approaching graduation and first financial milestones" },
      { label: "Strategy", text: "Campus presence, financial literacy workshops, student-focused products" },
      { label: "Long-term Value", text: "Lifetime members captured at their 'first decision' moment" }
    ],
    image: "university_students__dc695de4.jpg",
    script: "The university pipeline is about capturing members for life. When a student opens their first real account, gets their first car loan, or starts saving for their first home - that's the moment of loyalty. I will position Allegacy as the trusted partner for NC A&T and UNCG students at that critical transition point."
  },
  {
    number: 5,
    title: "Priority 3 - First-Time Milestones",
    subtitle: "Cars, Homes, and Financial Futures",
    points: [
      { label: "First-Time Auto Loans", text: "Competitive rates for graduates entering the workforce" },
      { label: "First-Time Homebuyers", text: "Pipeline from GHA savings programs to mortgage products" },
      { label: "Financial Education", text: "Workshops and tools to prepare members for major purchases" }
    ],
    image: "family_first_time_ho_71cbd91c.jpg",
    script: "Every person in the Transition Zone is moving toward a milestone. Whether it's their first car after college or their first home after years of saving through GHA programs, Allegacy will be there with the right product at the right time. This is not about selling - it's about serving people at the most important financial moments of their lives."
  },
  {
    number: 6,
    title: "The Strategic Advantage",
    subtitle: "Why This Pipeline Works",
    points: [
      { label: "Existing Relationships", text: "I've already built trust with GHA, community leaders, and educational institutions" },
      { label: "Proven Track Record", text: "Successfully implemented similar programs at Revity" },
      { label: "Community-First Approach", text: "Not just presence - essential integration into the community fabric" }
    ],
    image: "business_partnership_8e8f31e2.jpg",
    script: "What makes this different from any other community engagement plan? I've already done it. These aren't theoretical partnerships - they're relationships I've built over years of work. I'm not asking Allegacy to take a chance on an idea. I'm offering a proven playbook with the connections already in place to execute it immediately."
  },
  {
    number: 7,
    title: "The Call to Action",
    subtitle: "Making Allegacy Essential",
    points: [
      { label: "Phase 1", text: "Establish bi-weekly GHA presence within 30 days" },
      { label: "Phase 2", text: "Launch university outreach at NC A&T and UNCG" },
      { label: "Phase 3", text: "Roll out first-time buyer programs with measurable targets" },
      { label: "Goal", text: "Regional dominance through essential community integration" }
    ],
    image: "professional_busines_3ee35a7b.jpg",
    script: "I'm ready to start immediately. Within the first 30 days, I will have Allegacy embedded in the GHA community meetings. Within 60 days, we'll have a presence on both university campuses. By the end of the quarter, we'll have a clear pipeline of first-time buyers and long-term members. The question isn't whether this will work - it's how quickly we can make it happen."
  }
];

// Title Page
doc.rect(0, 0, 612, 100).fill(navy);
doc.fillColor('white').fontSize(28).font('Helvetica-Bold')
   .text('The Allegacy Impact Ecosystem', 50, 35, { align: 'center' });
doc.fillColor('#bfdbfe').fontSize(14)
   .text('Leveraging Strategic Pipelines for Regional Dominance', 50, 70, { align: 'center' });

doc.fillColor(gray).fontSize(12).font('Helvetica')
   .text('Presented by: Tavores Vanhook', 50, 130, { align: 'center' });

doc.fillColor(lightGray).fontSize(10)
   .text('Presentation Guide with Speaker Notes', 50, 160, { align: 'center' });

doc.moveDown(3);
doc.fillColor(gray).fontSize(11).font('Helvetica')
   .text('This document contains all 7 slides with:', 100, 220);
doc.list([
  'Slide titles and subtitles',
  'Key talking points',
  'Full speaker notes',
  'Suggested stock images'
], 120, 245);

doc.moveDown(2);
doc.fillColor(lightGray).fontSize(9)
   .text('Stock images are located in: attached_assets/stock_images/', 50, 350, { align: 'center' });

// Generate each slide
slides.forEach((slide, index) => {
  doc.addPage();
  
  // Header bar
  doc.rect(0, 0, 612, 80).fill(navy);
  
  // Slide number badge
  doc.roundedRect(50, 15, 60, 22, 10).fill('rgba(255,255,255,0.2)');
  doc.fillColor('white').fontSize(10).font('Helvetica')
     .text(`Slide ${slide.number}`, 55, 20);
  
  // Title
  doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
     .text(slide.title, 50, 42);
  
  // Subtitle
  doc.fillColor('#93c5fd').fontSize(12).font('Helvetica')
     .text(slide.subtitle, 50, 65);
  
  if (slide.presenter) {
    doc.fillColor('#bfdbfe').fontSize(10)
       .text(slide.presenter, 400, 65);
  }
  
  let yPos = 100;
  
  // Suggested Image
  doc.fillColor(blue).fontSize(11).font('Helvetica-Bold')
     .text('Suggested Image:', 50, yPos);
  doc.fillColor(lightGray).fontSize(10).font('Helvetica')
     .text(slide.image, 160, yPos);
  
  yPos += 30;
  
  // Key Points
  if (slide.points.length > 0) {
    doc.fillColor(navy).fontSize(12).font('Helvetica-Bold')
       .text('Key Points', 50, yPos);
    yPos += 20;
    
    slide.points.forEach(point => {
      doc.rect(50, yPos, 512, 35).fill('#f9fafb');
      doc.fillColor(navy).fontSize(10).font('Helvetica-Bold')
         .text(point.label + ':', 60, yPos + 8);
      doc.fillColor(gray).font('Helvetica')
         .text(point.text, 60, yPos + 20, { width: 490 });
      yPos += 40;
    });
  }
  
  yPos += 15;
  
  // Speaker Notes
  doc.fillColor(amber).fontSize(12).font('Helvetica-Bold')
     .text('Speaker Notes', 50, yPos);
  yPos += 20;
  
  // Amber left border
  doc.rect(50, yPos, 4, 120).fill(amber);
  doc.rect(54, yPos, 508, 120).fill('#fffbeb');
  
  doc.fillColor(gray).fontSize(10).font('Helvetica-Oblique')
     .text('"' + slide.script + '"', 65, yPos + 10, { 
       width: 480, 
       lineGap: 4 
     });
});

// Final page
doc.addPage();
doc.rect(0, 0, 612, 792).fill('#f9fafb');

doc.fillColor(navy).fontSize(24).font('Helvetica-Bold')
   .text('Ready to Present!', 50, 200, { align: 'center' });

doc.fillColor(gray).fontSize(12).font('Helvetica')
   .text('Copy each slide\'s content and suggested images into your PowerPoint or Google Slides.', 50, 240, { align: 'center' });

doc.moveDown(2);

// Badges
const badgeY = 300;
doc.roundedRect(150, badgeY, 80, 30, 5).fill('#dbeafe');
doc.fillColor('#1d4ed8').fontSize(11).font('Helvetica-Bold')
   .text('7 Slides', 155, badgeY + 9);

doc.roundedRect(250, badgeY, 110, 30, 5).fill('#d1fae5');
doc.fillColor('#059669').fontSize(11).font('Helvetica-Bold')
   .text('6 Custom Images', 255, badgeY + 9);

doc.roundedRect(380, badgeY, 120, 30, 5).fill('#fef3c7');
doc.fillColor('#d97706').fontSize(11).font('Helvetica-Bold')
   .text('Full Speaker Notes', 385, badgeY + 9);

doc.fillColor(lightGray).fontSize(10).font('Helvetica')
   .text('Good luck with your presentation!', 50, 380, { align: 'center' });

doc.end();
console.log('PDF generated at:', outputPath);
