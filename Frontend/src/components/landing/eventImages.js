import birthdayImage from '@/assets/birthday.avif';
import concertImage from '@/assets/live concerts.avif';
import weddingImage from '@/assets/wedding.avif';
import receptionImage from '@/assets/Main.jpg';
import API from '@/api/api';

const fallbackImages = [receptionImage, weddingImage, concertImage, birthdayImage];
const themedImages = [
  [/\bbirthdays?\b/i, birthdayImage],
  [/\b(weddings?|bridal|engagements?)\b/i, weddingImage],
  [/\b(concerts?|music|gigs?)\b/i, concertImage],
  [/\b(expos?|exhibitions?|corporate|conferences?)\b/i, receptionImage],
];

function matchImage(value) {
  return themedImages.find(([pattern]) => pattern.test(value ?? ''))?.[1];
}

export function getEventImage(event, index = 0) {
  if (event.hasImage) return API.getUri({ url: `/events/${event._id}/image`, params: { v: event.updatedAt } });
  const image = event.image || event.banner || event.coverImage || event.poster;
  return typeof image === 'string' && image.trim()
    ? image.trim()
    : matchImage(event.category) || matchImage(event.title) || fallbackImages[index % fallbackImages.length];
}
