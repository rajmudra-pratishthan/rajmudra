import { BookOpen, Heart, Landmark, Palette, Trophy, Users } from 'lucide-react';
import type { Event, IconType, Reel, TeamMember, Testimonial } from './types';

export const images = {
  hero: '/images/hero-volunteers.jpg',
  culture: '/images/culture-festival.jpg',
  education: '/images/education-school.jpg',
  sports: '/images/sports-cricket.jpg',
  school: '/images/school-children.jpg',
  community: '/images/community-aid.jpg',
  rangoli: '/images/rangoli-art.jpg',
  flag: '/images/flag-india.jpg',
  gathering: '/images/gathering-community.jpg',
  volunteers: '/images/volunteers-packing.jpg',
  festival: '/images/festival-people.jpg',
};

export const navItems = [['Home', '/'], ['About us', '/about'], ['Our work', '/#work'], ['Events', '/events'], ['Our team', '/team'], ['Contact', '/#contact']];

export const focusAreas: { title: string; text: string; icon: IconType; number: string }[] = [
  { title: 'Social service', text: 'Support for families in need and initiatives that strengthen everyday community life.', icon: Heart, number: '01' },
  { title: 'Culture', text: 'Preserving and celebrating Indian and Maharashtrian traditions through shared experiences.', icon: Landmark, number: '02' },
  { title: 'Education', text: 'Learning resources, competitions and encouragement for students to move forward.', icon: BookOpen, number: '03' },
  { title: 'Sports', text: 'Healthy competition, teamwork and opportunities for young people to grow.', icon: Trophy, number: '04' },
  { title: 'Art', text: 'Space for drawing, dance, speaking, rangoli and every form of creative expression.', icon: Palette, number: '05' },
  { title: 'Community development', text: 'Programs that bring local people together with purpose and pride.', icon: Users, number: '06' },
];

export const sampleEvents: Event[] = [
  { slug: 'shiv-janmotsav-2026', title: 'Chhatrapati Shivaji Maharaj Birth Celebration', description: 'A celebration of art, sport, knowledge and culture, bringing every generation together.', category: 'Cultural', event_date: '2026-03-19', location: 'Community Grounds, Maharashtra', image_url: images.festival, highlights: ['Drawing and speech competitions', 'Chess and sports events', 'Community prize ceremony'] },
  { slug: 'education-kit-2026', title: 'Student Education Kit Distribution', description: 'School supplies and encouragement for students as they begin a new academic year.', category: 'Educational', event_date: '2026-06-14', location: 'Maharashtra', image_url: images.education, highlights: ['School kits', 'Books and stationery', 'Parent conversations'] },
  { slug: 'community-sports-2026', title: 'Youth Sports Festival', description: 'A day of teamwork, discipline and healthy competition for young people in our community.', category: 'Sports', event_date: '2026-08-09', location: 'Community Sports Ground', image_url: images.sports, highlights: ['Cricket', 'Volleyball', 'Tug of war'] },
];

export const fallbackTeam: TeamMember[] = [
  { id: '1', display_name: 'Name coming soon', position: 'President', occupation: 'Social service', profile_image_url: images.community },
  { id: '2', display_name: 'Name coming soon', position: 'Vice President', occupation: 'Community development', profile_image_url: images.gathering },
  { id: '3', display_name: 'Name coming soon', position: 'Secretary', occupation: 'Education', profile_image_url: images.education },
  { id: '4', display_name: 'Name coming soon', position: 'Treasurer', occupation: 'Finance & operations', profile_image_url: images.school },
  { id: '5', display_name: 'Name coming soon', position: 'Program coordinator', occupation: 'Arts and culture', profile_image_url: images.festival },
  { id: '6', display_name: 'Name coming soon', position: 'Outreach lead', occupation: 'Sports and youth', profile_image_url: images.sports },
];

export const fallbackTestimonials: Testimonial[] = [
  { id: '1', name: 'Community well-wisher', designation: 'Appreciation Message', organization: 'Rajmudra Pratishthan', message: 'The organization\u2019s community-first initiatives and consistent work are truly inspiring.', photo_url: null },
  { id: '2', name: 'School teacher', designation: 'Education partner', organization: 'Local School', message: 'Their work to preserve culture while involving the next generation is deeply admirable.', photo_url: null },
  { id: '3', name: 'Local resident', designation: 'Community member', organization: 'Maharashtra', message: 'This is a sincere organization that brings every part of the community into the conversation.', photo_url: null },
  { id: '4', name: 'Volunteer', designation: 'Active member', organization: 'Rajmudra Pratishthan', message: 'Watching children and elders celebrate together at their events is a beautiful sight.', photo_url: null },
  { id: '5', name: 'Donor', designation: 'Supporter', organization: 'Rajmudra Pratishthan', message: 'They turned a simple idea into a movement that now touches thousands of lives.', photo_url: null },
];

export const fallbackReels: Reel[] = [
  { id: '1', reel_url: 'https://instagram.com', title: '01', thumbnail_url: images.culture },
  { id: '2', reel_url: 'https://instagram.com', title: '02', thumbnail_url: images.rangoli },
  { id: '3', reel_url: 'https://instagram.com', title: '03', thumbnail_url: images.sports },
  { id: '4', reel_url: 'https://instagram.com', title: '04', thumbnail_url: images.community },
];
