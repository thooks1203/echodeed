const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ 
  size: 'LETTER',
  margins: { top: 40, bottom: 40, left: 40, right: 40 }
});

const outputPath = path.join(__dirname, '..', 'public', 'Allegacy-Presentation-v6.pdf');
doc.pipe(fs.createWriteStream(outputPath));

const navy = '#003366';
const allegacyRed = '#8B1A1A';
const allegacyGold = '#DAA520';
const amber = '#f59e0b';
const gray = '#374151';
const lightGray = '#6b7280';
const green = '#059669';

function addImage(doc, imagePath, x, y, options) {
  const fullPath = path.join(__dirname, '..', imagePath);
  if (fs.existsSync(fullPath)) {
    try {
      doc.image(fullPath, x, y, options);
      return true;
    } catch (e) {
      console.log('Image error:', imagePath, e.message);
      return false;
    }
  }
  console.log('Image not found:', fullPath);
  return false;
}

// ==================== SLIDE 1: COVER ====================
doc.rect(0, 0, 612, 792).fill('#f8f9fa');

addImage(doc, 'attached_assets/image_1769021028223.png', 206, 50, { width: 200 });

doc.fillColor(gray).fontSize(10).font('Helvetica')
   .text('Since 1967 | $2.12B in Assets | Newsweek 4-Star Rated | 28 Branches', 40, 145, { align: 'center' });

doc.fillColor(navy).fontSize(26).font('Helvetica-Bold')
   .text('THE ALLEGACY IMPACT ECOSYSTEM', 40, 170, { align: 'center' });

doc.fillColor(allegacyRed).fontSize(13).font('Helvetica-Bold')
   .text('Leveraging Strategic Pipelines for Regional Dominance', 40, 200, { align: 'center' });

// Profile photo
addImage(doc, 'attached_assets/profile_suit_pic_1769023711572.jpg', 231, 230, { width: 150, height: 150 });

doc.fillColor(gray).fontSize(14).font('Helvetica-Bold')
   .text('Presented by', 40, 400, { align: 'center' });
doc.fillColor(navy).fontSize(24).font('Helvetica-Bold')
   .text('Tavores Vanhook', 40, 420, { align: 'center' });
doc.fillColor(allegacyRed).fontSize(11).font('Helvetica-Bold')
   .text('Regional Business and Community Development Specialist - Palladium', 40, 455, { align: 'center' });

doc.roundedRect(80, 490, 452, 80, 8).fill('#003366');
doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
   .text('MY VALUE PROPOSITION:', 100, 505);
doc.fillColor('#bfdbfe').fontSize(10).font('Helvetica')
   .text('"I don\'t just bring ideas. I bring proven relationships, tested strategies, and a pipeline already in motion. I will make Allegacy essential to this region."', 100, 525, { width: 412 });

doc.fillColor(lightGray).fontSize(9)
   .text('January 2026', 40, 720, { align: 'center' });

// ==================== SLIDE 2: THE OPPORTUNITY ====================
doc.addPage();
doc.rect(0, 0, 612, 70).fill(navy);
doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
   .text('The Regional Opportunity', 40, 25, { align: 'center' });
doc.fillColor('#93c5fd').fontSize(12)
   .text('The Growth Corridor: Palladium to University District', 40, 52, { align: 'center' });

let y = 90;

doc.fillColor(navy).fontSize(14).font('Helvetica-Bold')
   .text('Why This Region, Why Now?', 40, y);
y += 25;

const opportunities = [
  { icon: '1', title: 'Palladium District Growth', desc: 'High-density professional and residential development creating thousands of new households' },
  { icon: '2', title: 'University Enrollment', desc: '35,000+ students at NC A&T and UNCG approaching their "first financial decision" moments' },
  { icon: '3', title: 'GHA Transformation', desc: 'Greensboro Housing Authority residents actively building toward homeownership through FSS' },
  { icon: '4', title: 'Transition Demographics', desc: 'Thousands moving from renting to owning, from student to professional, from saving to investing' }
];

opportunities.forEach((opp, i) => {
  doc.rect(40, y, 532, 45).fill(i % 2 === 0 ? '#f0f9ff' : '#f8fafc');
  doc.fillColor(allegacyRed).fontSize(18).font('Helvetica-Bold')
     .text(opp.icon, 55, y + 12);
  doc.fillColor(navy).fontSize(11).font('Helvetica-Bold')
     .text(opp.title, 85, y + 8);
  doc.fillColor(gray).fontSize(10).font('Helvetica')
     .text(opp.desc, 85, y + 24, { width: 470 });
  y += 50;
});

y += 20;
doc.fillColor(green).fontSize(12).font('Helvetica-Bold')
   .text('THE BOTTOM LINE:', 40, y);
doc.fillColor(gray).fontSize(11).font('Helvetica')
   .text('This is not just growth - it\'s a generational opportunity to capture lifetime members at their moment of decision.', 170, y, { width: 380 });

// ==================== SLIDE 3: GHA WEALTH ENGINE ====================
doc.addPage();
doc.rect(0, 0, 612, 70).fill(navy);
doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
   .text('Priority 1: The "Wealth Engine"', 40, 20);
doc.fillColor('#93c5fd').fontSize(12)
   .text('Greensboro Housing Authority & Family Self-Sufficiency Program', 40, 47);

addImage(doc, 'attached_assets/image_1769020987345.png', 40, 85, { width: 532, height: 140 });

y = 240;
doc.fillColor(navy).fontSize(13).font('Helvetica-Bold')
   .text('My Existing Relationship:', 40, y);
y += 20;
doc.fillColor(gray).fontSize(10).font('Helvetica')
   .text('At Revity, I helped engineer the High-Yield CD savings program for FSS participants. I have a seat at the table at Claremont Courts - not just a contact, but an active partnership. Meeting scheduled Jan 30th with Todd A. Fagan, GHA Resident Engagement & Homeownership Coordinator.', 40, y, { width: 532 });

y += 45;
doc.fillColor(allegacyRed).fontSize(12).font('Helvetica-Bold')
   .text('THE STRATEGY:', 40, y);
y += 20;

const ghaStrategies = [
  { title: 'Bi-Weekly Presence', desc: 'Embedded in Claremont Courts community meetings' },
  { title: '"Savings-to-Legacy" CD Program', desc: 'High-yield savings for FSS escrow accounts' },
  { title: 'First-Time Homebuyer Pipeline', desc: 'FSS graduation to Allegacy mortgage products' },
  { title: 'Enhanced Credit Building', desc: 'Leverage secured card + coaching for FSS participants' }
];

ghaStrategies.forEach((strat, i) => {
  const xPos = i < 2 ? 40 : 300;
  const yPos = i % 2 === 0 ? y : y;
  doc.rect(xPos, y + Math.floor(i / 2) * 50, 250, 45).fill('#fef3c7');
  doc.fillColor(navy).fontSize(10).font('Helvetica-Bold')
     .text(strat.title, xPos + 10, y + Math.floor(i / 2) * 50 + 8);
  doc.fillColor(gray).fontSize(9).font('Helvetica')
     .text(strat.desc, xPos + 10, y + Math.floor(i / 2) * 50 + 22, { width: 230 });
});

y += 120;

const ghaResults = [
  { metric: '500+', label: 'FSS Participants' },
  { metric: '$5K-$15K', label: 'Avg Escrow Savings' },
  { metric: '85%', label: 'Want Homeownership' }
];

let metricX = 60;
ghaResults.forEach(result => {
  doc.rect(metricX, y, 150, 60).fill('#dcfce7');
  doc.fillColor(green).fontSize(20).font('Helvetica-Bold')
     .text(result.metric, metricX, y + 12, { width: 150, align: 'center' });
  doc.fillColor(gray).fontSize(10).font('Helvetica')
     .text(result.label, metricX, y + 40, { width: 150, align: 'center' });
  metricX += 170;
});

// ==================== SLIDE 4: UNIVERSITY HUB ====================
doc.addPage();
doc.rect(0, 0, 612, 70).fill(navy);
doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
   .text('Priority 2: The "University Hub"', 40, 20);
doc.fillColor('#93c5fd').fontSize(12)
   .text('NC A&T State University + UNC Greensboro Strategic Pipeline', 40, 47);

addImage(doc, 'attached_assets/image_1769021206101.png', 40, 85, { width: 260, height: 100 });
addImage(doc, 'attached_assets/image_1769021268422.png', 312, 85, { width: 260, height: 100 });

y = 200;
doc.fillColor(navy).fontSize(13).font('Helvetica-Bold')
   .text('35,000+ Students = 35,000 Future Members', 40, y, { align: 'center' });

y += 30;
doc.fillColor(allegacyRed).fontSize(11).font('Helvetica-Bold')
   .text('INNOVATIVE STRATEGIES:', 40, y);
y += 20;

const uniStrategies = [
  { title: '"First Dollar" Digital Onboarding', desc: 'QR codes at orientation for instant account setup with $25 bonus', tag: 'NEW' },
  { title: 'Peer Ambassador Program', desc: 'Train student leaders to recruit peers with incentives', tag: 'NEW' },
  { title: 'Financial Wellness Score', desc: 'Gamified app feature students track like a fitness score', tag: 'NEW' },
  { title: 'GHOE Pop-Up Banking', desc: 'High-visibility presence at homecoming (50,000+ attendees)', tag: 'PROVEN' },
  { title: 'Graduation Milestone Program', desc: 'Auto loan & credit card offers timed to graduation', tag: 'PROVEN' }
];

uniStrategies.forEach(strat => {
  doc.rect(40, y, 532, 38).fill('#f0f9ff');
  const badgeColor = strat.tag === 'NEW' ? '#059669' : '#0369a1';
  doc.roundedRect(45, y + 5, 45, 14, 3).fill(badgeColor);
  doc.fillColor('white').fontSize(7).font('Helvetica-Bold')
     .text(strat.tag, 48, y + 7);
  doc.fillColor(navy).fontSize(10).font('Helvetica-Bold')
     .text(strat.title, 100, y + 5);
  doc.fillColor(gray).fontSize(9).font('Helvetica')
     .text(strat.desc, 100, y + 20, { width: 455 });
  y += 42;
});

y += 10;
addImage(doc, 'attached_assets/image_1769021226821.png', 40, y, { width: 532, height: 110 });

// ==================== SLIDE 5: EMPLOYER PIPELINE ====================
doc.addPage();
doc.rect(0, 0, 612, 70).fill(navy);
doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
   .text('Priority 3: Employer Pipeline Program', 40, 20);
doc.fillColor('#93c5fd').fontSize(12)
   .text('Capturing Members Through Workplace Partnerships', 40, 47);

y = 90;
doc.fillColor(allegacyRed).fontSize(14).font('Helvetica-Bold')
   .text('THE INNOVATION:', 40, y);
y += 25;

doc.rect(40, y, 532, 55).fill('#fef3c7');
doc.fillColor(gray).fontSize(10).font('Helvetica')
   .text('Most credit unions wait for members to walk in. I propose we GO TO THEM. Partner with major employers for direct deposit incentives, on-site enrollment, and HR partnerships.', 55, y + 12, { width: 500 });
y += 70;

doc.fillColor(navy).fontSize(12).font('Helvetica-Bold')
   .text('Target Employers:', 40, y);
y += 25;

const employers = [
  { name: 'REYNOLDS AMERICA', examples: 'High-impact target (needs massaging)', members: 'TOP PRIORITY' },
  { name: 'WAKE FOREST UNIV', examples: 'Better penetration goal', members: '9,322 students' },
  { name: 'HABITAT FOR HUMANITY', examples: 'Community partnership', members: 'Mission alignment' },
  { name: 'CHAMBER MEMBERS', examples: 'Guilford Merchants Assoc.', members: 'Business network' }
];

employers.forEach((emp, i) => {
  const xPos = (i % 2) * 270 + 40;
  const yPos = y + Math.floor(i / 2) * 60;
  doc.rect(xPos, yPos, 255, 55).fill(i % 2 === 0 ? '#dbeafe' : '#e0e7ff');
  doc.fillColor(navy).fontSize(10).font('Helvetica-Bold')
     .text(emp.name, xPos + 10, yPos + 8);
  doc.fillColor(gray).fontSize(9).font('Helvetica')
     .text(emp.examples, xPos + 10, yPos + 22);
  doc.fillColor(green).fontSize(9).font('Helvetica-Bold')
     .text(emp.members, xPos + 10, yPos + 38);
});

y += 140;
doc.fillColor(allegacyRed).fontSize(11).font('Helvetica-Bold')
   .text('THE APPROACH:', 40, y);
y += 20;

const approaches = [
  'On-site enrollment during open enrollment periods',
  '$100 direct deposit bonus for new members (NEW incentive)',
  'Payroll deduction savings programs',
  'Extend Allegacy\'s existing workshops TO employer sites (leverage strength)'
];

approaches.forEach(app => {
  doc.fillColor(navy).fontSize(14).text('>', 50, y);
  doc.fillColor(gray).fontSize(10).font('Helvetica')
     .text(app, 70, y + 2);
  y += 22;
});

// ==================== SLIDE 6: DIGITAL INNOVATION ====================
doc.addPage();
doc.rect(0, 0, 612, 70).fill(navy);
doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
   .text('The Digital Advantage', 40, 20);
doc.fillColor('#93c5fd').fontSize(12)
   .text('Meeting Members Where They Are - On Their Phones', 40, 47);

y = 90;
doc.fillColor(gray).fontSize(10).font('Helvetica')
   .text('Students and young professionals are mobile-first. Allegacy\'s digital strategy must meet them there.', 40, y, { width: 532 });

y += 35;
doc.fillColor(allegacyRed).fontSize(12).font('Helvetica-Bold')
   .text('PROPOSED DIGITAL INNOVATIONS:', 40, y);
y += 25;

const digitalIdeas = [
  { title: 'Financial Wellness Score', desc: 'Gamified score tracking savings habits. Students compete with friends. (Allegacy doesn\'t have this)', impact: '5x app engagement' },
  { title: '"Round-Up" Micro-Savings', desc: 'Every purchase rounds up to savings automatically. (Allegacy doesn\'t offer this)', impact: '$500+/yr savings' },
  { title: 'Instant QR Account Creation', desc: 'Scan QR at events, full account in 60 seconds. (Current QR is login only)', impact: '10x event signups' },
  { title: 'Peer Ambassador Incentives', desc: 'Student leaders recruit peers for rewards. (No referral program exists)', impact: 'Viral growth' }
];

digitalIdeas.forEach(idea => {
  doc.rect(40, y, 532, 55).fill('#f0fdf4');
  doc.fillColor(navy).fontSize(11).font('Helvetica-Bold')
     .text(idea.title, 50, y + 8);
  doc.fillColor(gray).fontSize(9).font('Helvetica')
     .text(idea.desc, 50, y + 24, { width: 380 });
  doc.roundedRect(450, y + 15, 110, 25, 4).fill(green);
  doc.fillColor('white').fontSize(8).font('Helvetica-Bold')
     .text(idea.impact, 455, y + 22, { width: 100, align: 'center' });
  y += 60;
});

// ==================== SLIDE 7: 90-DAY PLAN ====================
doc.addPage();
doc.rect(0, 0, 612, 70).fill(navy);
doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
   .text('The 90-Day Launch Plan', 40, 20);
doc.fillColor('#93c5fd').fontSize(12)
   .text('From Day One to Regional Dominance', 40, 47);

y = 90;

const phases = [
  { days: 'Days 1-30', title: 'IMMERSION', color: '#dbeafe', items: ['Audit current business relationships', 'Attend Chamber & Guilford Merchants Association meetings', 'Establish bi-weekly GHA presence at Claremont Courts', 'Map university student life offices at NC A&T, UNCG, Wake Forest'] },
  { days: 'Days 31-60', title: 'ACTIVATION', color: '#fef3c7', items: ['Secure meetings with 5-10 prospective businesses', 'Begin strategic outreach to Reynolds America', 'Launch "First Dollar" QR enrollment at universities', 'Initiate Habitat for Humanity partnership discussions'] },
  { days: 'Days 61-90', title: 'RESULTS', color: '#dcfce7', items: ['Secure 1 high-impact partner (target: Reynolds America)', 'Wake Forest University member growth campaign', 'Measure pipeline results & present strategic plan', 'Prepare for GHOE major activation'] }
];

phases.forEach(phase => {
  doc.rect(40, y, 532, 100).fill(phase.color);
  doc.fillColor(allegacyRed).fontSize(12).font('Helvetica-Bold')
     .text(phase.days, 55, y + 10);
  doc.fillColor(navy).fontSize(14).font('Helvetica-Bold')
     .text(phase.title, 140, y + 10);
  
  let itemY = y + 32;
  phase.items.forEach(item => {
    doc.fillColor(navy).fontSize(10).text('>', 55, itemY);
    doc.fillColor(gray).fontSize(10).font('Helvetica')
       .text(item, 75, itemY);
    itemY += 16;
  });
  y += 110;
});

// ==================== SLIDE 8: WHY ME ====================
doc.addPage();
doc.rect(0, 0, 612, 70).fill(allegacyRed);
doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
   .text('Why Tavores Vanhook?', 40, 25, { align: 'center' });

y = 90;
doc.fillColor(navy).fontSize(14).font('Helvetica-Bold')
   .text('I Don\'t Just Have Ideas - I Have Proof', 40, y);
y += 30;

const whyMe = [
  { claim: 'Existing GHA Relationship', proof: 'Engineered the High-Yield CD program at Revity for FSS participants. I already have a seat at Claremont Courts.' },
  { claim: 'Community Integration', proof: 'As founder of EchoDeed, I work with Eastern Guilford schools, understanding how to build trust in diverse communities.' },
  { claim: 'University Connections', proof: 'Active relationships with NC A&T community through local business development and youth mentorship.' },
  { claim: 'Digital Innovation Mindset', proof: 'Built EchoDeed from scratch - a mobile-first platform that engages students and drives behavioral change.' },
  { claim: 'Results-Driven Approach', proof: 'Every strategy I propose comes with measurable targets and accountability. No vague promises.' }
];

whyMe.forEach((item, i) => {
  doc.rect(40, y, 532, 50).fill(i % 2 === 0 ? '#fef2f2' : '#fdf4ff');
  doc.fillColor(allegacyRed).fontSize(11).font('Helvetica-Bold')
     .text(item.claim, 55, y + 8);
  doc.fillColor(gray).fontSize(9).font('Helvetica')
     .text(item.proof, 55, y + 24, { width: 500 });
  y += 55;
});

y += 15;
doc.rect(40, y, 532, 65).fill(navy);
doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
   .text('MY COMMITMENT:', 55, y + 12);
doc.fillColor('#bfdbfe').fontSize(10).font('Helvetica')
   .text('"I will make Allegacy the default financial partner for every person in transition in the Palladium region. Not through advertising - through essential integration into the moments that matter most."', 55, y + 30, { width: 500 });

// ==================== SLIDE 9: CALL TO ACTION ====================
doc.addPage();
doc.rect(0, 0, 612, 792).fill('#f8f9fa');

addImage(doc, 'attached_assets/image_1769021028223.png', 206, 60, { width: 200 });

doc.fillColor(navy).fontSize(28).font('Helvetica-Bold')
   .text('Let\'s Build This Together', 40, 200, { align: 'center' });

doc.fillColor(gray).fontSize(14).font('Helvetica')
   .text('The pipeline is ready. The relationships are built.', 40, 250, { align: 'center' });
doc.text('The only question is: How fast do we want to grow?', 40, 275, { align: 'center' });

const metrics = [
  { number: '35,000+', label: 'University Students' },
  { number: '500+', label: 'GHA FSS Participants' },
  { number: '40,000+', label: 'Regional Employees' }
];

let metricX2 = 90;
metrics.forEach(metric => {
  doc.roundedRect(metricX2, 330, 140, 80, 8).fill(navy);
  doc.fillColor('white').fontSize(24).font('Helvetica-Bold')
     .text(metric.number, metricX2, 350, { width: 140, align: 'center' });
  doc.fillColor('#93c5fd').fontSize(10).font('Helvetica')
     .text(metric.label, metricX2, 385, { width: 140, align: 'center' });
  metricX2 += 160;
});

doc.fillColor(allegacyRed).fontSize(16).font('Helvetica-Bold')
   .text('= Your Future Members', 40, 440, { align: 'center' });

doc.rect(60, 490, 492, 100).fill(navy);
doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
   .text('YOUR PRIORITIES - MY PLAN:', 80, 505);
doc.fillColor('#93c5fd').fontSize(9).font('Helvetica')
   .text('> Audit current business relationships & attend Chamber/Merchants Association meetings', 80, 525);
doc.text('> Secure 5-10 prospective business meetings to land 1 high-impact partner', 80, 540);
doc.text('> Strategic approach to Reynolds America, Wake Forest University, Habitat for Humanity', 80, 555);
doc.text('> Connect the gaps with a comprehensive strategic plan', 80, 570);

doc.fillColor(navy).fontSize(12).font('Helvetica')
   .text('Tavores Vanhook', 40, 630, { align: 'center' });
doc.fillColor(gray).fontSize(10)
   .text('Regional Business and Community Development Specialist - Palladium', 40, 650, { align: 'center' });

doc.fillColor(allegacyRed).fontSize(12).font('Helvetica-Bold')
   .text('Ready to start on Day One.', 40, 690, { align: 'center' });

doc.end();
console.log('PDF generated at:', outputPath);
