import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Image, Award, FileText } from "lucide-react";

import logo1 from "@assets/echodeed_logo_option1_heart_echo.png";
import logo2 from "@assets/echodeed_logo_option2_hands_heart.png";
import logo3 from "@assets/echodeed_logo_option3_character_star.png";
import decal from "@assets/echodeed_partner_window_decal.png";
import flyerFront from "@assets/echodeed_sponsor_flyer_front.png";
import flyerBack from "@assets/echodeed_sponsor_flyer_back.png";

export default function MarketingAssets() {
  const downloadImage = (src: string, filename: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            EchoDeed™ Marketing Assets
          </h1>
          <p className="text-gray-600 text-lg">Sponsor Outreach & Brand Materials</p>
        </div>

        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Image className="w-6 h-6" />
              Logo Options (Choose Your Favorite)
            </CardTitle>
            <CardDescription className="text-purple-100">
              3 professional logo concepts for EchoDeed
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-purple-100 hover:border-purple-400 transition-colors">
                  <img src={logo1} alt="Logo Option 1 - Heart Echo" className="w-full max-w-[200px] mx-auto" />
                </div>
                <h3 className="font-bold text-purple-900">Option 1: Heart Echo</h3>
                <p className="text-sm text-gray-600">Ripples of kindness spreading outward</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadImage(logo1, 'echodeed_logo_heart_echo.png')}
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>

              <div className="text-center space-y-4">
                <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-purple-100 hover:border-purple-400 transition-colors">
                  <img src={logo2} alt="Logo Option 2 - Community Hands" className="w-full max-w-[200px] mx-auto" />
                </div>
                <h3 className="font-bold text-purple-900">Option 2: Community Hands</h3>
                <p className="text-sm text-gray-600">Hands forming a heart - togetherness</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadImage(logo2, 'echodeed_logo_hands_heart.png')}
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>

              <div className="text-center space-y-4">
                <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-purple-100 hover:border-purple-400 transition-colors">
                  <img src={logo3} alt="Logo Option 3 - Character Star" className="w-full max-w-[200px] mx-auto" />
                </div>
                <h3 className="font-bold text-purple-900">Option 3: Character Star</h3>
                <p className="text-sm text-gray-600">Celebrating excellence and achievement</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadImage(logo3, 'echodeed_logo_character_star.png')}
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6" />
              Partner Window Decal
            </CardTitle>
            <CardDescription className="text-amber-100">
              "The Sticker Close" - Physical decal for business doors
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-amber-100 flex-shrink-0">
                <img src={decal} alt="Partner Window Decal" className="w-64 h-64 object-contain" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-amber-900">"Proud EchoDeed Community Partner"</h3>
                <p className="text-gray-700">
                  This window decal is your <strong>psychological close</strong>. When visiting Burlington Road businesses, 
                  show them this physical sticker they can display on their door. It transforms them from a donor 
                  into a <em>visible community pillar</em>.
                </p>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Print Specs:</strong> 4" x 4" vinyl decal, weatherproof, UV-resistant. 
                    Local print shops can produce these for ~$2-3 each in batches of 50+.
                  </p>
                </div>
                <Button 
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => downloadImage(decal, 'echodeed_partner_decal.png')}
                >
                  <Download className="w-4 h-4 mr-2" /> Download Decal Design
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-rose-200">
          <CardHeader className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Sponsor Flyer (Card Stock Ready)
            </CardTitle>
            <CardDescription className="text-rose-100">
              Double-sided flyer for potential partners on Burlington Road
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-rose-900 text-center">Front Side</h3>
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-rose-100">
                  <img src={flyerFront} alt="Sponsor Flyer Front" className="w-full rounded-lg" />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-rose-300 text-rose-700 hover:bg-rose-50"
                  onClick={() => downloadImage(flyerFront, 'echodeed_sponsor_flyer_front.png')}
                >
                  <Download className="w-4 h-4 mr-2" /> Download Front
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-rose-900 text-center">Back Side</h3>
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-rose-100">
                  <img src={flyerBack} alt="Sponsor Flyer Back" className="w-full rounded-lg" />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-rose-300 text-rose-700 hover:bg-rose-50"
                  onClick={() => downloadImage(flyerBack, 'echodeed_sponsor_flyer_back.png')}
                >
                  <Download className="w-4 h-4 mr-2" /> Download Back
                </Button>
              </div>
            </div>

            <div className="mt-6 bg-rose-50 p-4 rounded-lg border border-rose-200">
              <p className="text-sm text-rose-800">
                <strong>Print Specs:</strong> 8.5" x 11" on 100lb gloss card stock. 
                Double-sided printing. Staples, FedEx Office, or local print shops can produce 50 copies for ~$40-60.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
            <CardTitle>Burlington Road Target List</CardTitle>
            <CardDescription className="text-blue-100">Priority businesses to visit with flyers</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Chick-fil-A Burlington Rd",
                "Biscuitville Burlington Rd", 
                "Pizza Hut Burlington Rd",
                "McDonald's Burlington Rd",
                "Wendy's Burlington Rd",
                "Taco Bell Burlington Rd",
                "Subway Burlington Rd",
                "Bojangles Burlington Rd",
                "Zaxby's Burlington Rd",
                "Cook Out",
                "Mom & Pop Shops",
                "Local Pizza Places"
              ].map((business, i) => (
                <div key={i} className="bg-blue-50 p-3 rounded-lg text-center text-sm font-medium text-blue-900 border border-blue-200">
                  {business}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
