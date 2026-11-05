import birthdayImage from '@/assets/birthday.avif';
import concertImage from '@/assets/live concerts.avif';
import weddingImage from '@/assets/wedding.avif';

const fallbackImages = [weddingImage, concertImage, birthdayImage];

export function getEventImage(event, index = 0) {
  const image = event.image || event.banner || event.coverImage || event.poster;
  return typeof image === 'string' && image.trim()
    ? image
    : fallbackImages[index % fallbackImages.length];
}
