export default function AllegacyPresentation() {
  const communityMeeting = "/attached_assets/stock_images/professional_diverse_3ddbffc1.jpg";
  const universityStudents = "/attached_assets/stock_images/university_students__dc695de4.jpg";
  const businessStrategy = "/attached_assets/stock_images/professional_busines_b056ce0d.jpg";
  const firstTimeHomeBuyers = "/attached_assets/stock_images/family_first_time_ho_71cbd91c.jpg";
  const businessPartnership = "/attached_assets/stock_images/business_partnership_8e8f31e2.jpg";
  const affordableHousing = "/attached_assets/stock_images/affordable_housing_c_ff2431ac.jpg";
  const slides = [
    {
      number: 1,
      title: "The Allegacy Impact Ecosystem",
      subtitle: "Leveraging Strategic Pipelines for Regional Dominance",
      presenter: "Tavores Vanhook",
      image: businessStrategy,
      imageAlt: "Business strategy and growth",
      content: [],
      script: "Good morning/afternoon. Most plans for community engagement focus on being present. My plan is about being essential. I'm here today as a founder and a Business Development Manager to show you how I will anchor Allegacy into the fabric of the Palladium region by leveraging pipelines I have already built and proven."
    },
    {
      number: 2,
      title: "Regional Opportunities – The Growth Corridor",
      subtitle: "🗺️ Mapping the Transition Zones",
      image: affordableHousing,
      imageAlt: "Community development and housing",
      content: [
        { label: "Palladium Hub", text: "High-density professional and residential growth" },
        { label: "The 'Transition' Segment", text: "Students and GHA participants moving into first-time financial milestones (cars, homes, careers)" },
        { label: "Key Institutions", text: "Eastern Guilford, NC A&T, UNCG" }
      ],
      script: "The growth in this region is found in the 'Transition Zones.' We are looking at thousands of residents at the Greensboro Housing Authority and students at NC A&T and UNCG who are moving toward their first major financial milestones. My approach is to meet them at the point of decision, making Allegacy the undisputed choice for their financial future."
    },
    {
      number: 3,
      title: "Priority 1 – The 'Wealth Engine'",
      subtitle: "⚙️ GHA & Claremont Courts Partnership",
      image: communityMeeting,
      imageAlt: "Community financial planning meeting",
      content: [
        { label: "Frequency", text: "Bi-weekly presence at Claremont Courts meetings" },
        { label: "Innovation", text: "The 'Savings-to-Legacy' High-Yield CD Program" },
        { label: "The Result", text: "Direct membership growth and 'sticky' deposits" }
      ],
      script: "My first priority is the GHA. I don't just have a contact there; I have a seat at the table. At Revity, I helped engineer a High-Yield CD savings plan for FSS participants. I will bring that same intensity to Allegacy. By being present bi-weekly at Claremont Courts, we capture the escrowed savings of the program and create a direct pipeline for first-time homebuyer loans."
    },
    {
      number: 4,
      title: "Priority 2 – The 'University Hub'",
      subtitle: "🎓 NC A&T and UNCG Strategic Pipeline",
      image: universityStudents,
      imageAlt: "Diverse university students on campus",
      content: [
        { label: "Target Audience", text: "Students approaching graduation and first financial milestones" },
        { label: "Strategy", text: "Campus presence, financial literacy workshops, student-focused products" },
        { label: "Long-term Value", text: "Lifetime members captured at their 'first decision' moment" }
      ],
      script: "The university pipeline is about capturing members for life. When a student opens their first real account, gets their first car loan, or starts saving for their first home—that's the moment of loyalty. I will position Allegacy as the trusted partner for NC A&T and UNCG students at that critical transition point."
    },
    {
      number: 5,
      title: "Priority 3 – First-Time Milestones",
      subtitle: "🏠 Cars, Homes, and Financial Futures",
      image: firstTimeHomeBuyers,
      imageAlt: "Family receiving keys to new home",
      content: [
        { label: "First-Time Auto Loans", text: "Competitive rates for graduates entering the workforce" },
        { label: "First-Time Homebuyers", text: "Pipeline from GHA savings programs to mortgage products" },
        { label: "Financial Education", text: "Workshops and tools to prepare members for major purchases" }
      ],
      script: "Every person in the Transition Zone is moving toward a milestone. Whether it's their first car after college or their first home after years of saving through GHA programs, Allegacy will be there with the right product at the right time. This is not about selling—it's about serving people at the most important financial moments of their lives."
    },
    {
      number: 6,
      title: "The Strategic Advantage",
      subtitle: "🤝 Why This Pipeline Works",
      image: businessPartnership,
      imageAlt: "Business partnership and collaboration",
      content: [
        { label: "Existing Relationships", text: "I've already built trust with GHA, community leaders, and educational institutions" },
        { label: "Proven Track Record", text: "Successfully implemented similar programs at Revity" },
        { label: "Community-First Approach", text: "Not just presence—essential integration into the community fabric" }
      ],
      script: "What makes this different from any other community engagement plan? I've already done it. These aren't theoretical partnerships—they're relationships I've built over years of work. I'm not asking Allegacy to take a chance on an idea. I'm offering a proven playbook with the connections already in place to execute it immediately."
    },
    {
      number: 7,
      title: "The Call to Action",
      subtitle: "🚀 Making Allegacy Essential",
      image: businessStrategy,
      imageAlt: "Strategic business growth",
      content: [
        { label: "Phase 1", text: "Establish bi-weekly GHA presence within 30 days" },
        { label: "Phase 2", text: "Launch university outreach at NC A&T and UNCG" },
        { label: "Phase 3", text: "Roll out first-time buyer programs with measurable targets" },
        { label: "Goal", text: "Regional dominance through essential community integration" }
      ],
      script: "I'm ready to start immediately. Within the first 30 days, I will have Allegacy embedded in the GHA community meetings. Within 60 days, we'll have a presence on both university campuses. By the end of the quarter, we'll have a clear pipeline of first-time buyers and long-term members. The question isn't whether this will work—it's how quickly we can make it happen."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Allegacy Impact Ecosystem Presentation</h1>
          <p className="text-gray-600">Right-click images to save. Copy text into your PowerPoint/Google Slides.</p>
        </div>

        {slides.map((slide) => (
          <div key={slide.number} className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-[#003366] to-[#005599] text-white p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  Slide {slide.number}
                </span>
              </div>
              <h2 className="text-2xl font-bold">{slide.title}</h2>
              <p className="text-blue-100 text-lg">{slide.subtitle}</p>
              {slide.presenter && (
                <p className="text-blue-200 mt-2">Presented by: {slide.presenter}</p>
              )}
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Visual
                  </h3>
                  <img
                    src={slide.image}
                    alt={slide.imageAlt}
                    className="w-full rounded-lg shadow-md"
                  />
                  <p className="text-xs text-gray-400 mt-2 italic">Right-click → Save Image As...</p>
                </div>

                <div>
                  {slide.content.length > 0 && (
                    <>
                      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Key Points
                      </h3>
                      <div className="space-y-3 mb-6">
                        {slide.content.map((item, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-semibold text-[#003366]">{item.label}:</span>
                            <span className="text-gray-700 ml-2">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    Speaker Notes
                  </h3>
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                    <p className="text-gray-700 italic leading-relaxed">"{slide.script}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Present!</h2>
          <p className="text-gray-600 mb-4">
            Copy each slide's content and images into your PowerPoint or Google Slides.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700 font-medium">7 Slides</span>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-green-700 font-medium">6 Custom Images</span>
            </div>
            <div className="bg-amber-50 px-4 py-2 rounded-lg">
              <span className="text-amber-700 font-medium">Full Speaker Notes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
