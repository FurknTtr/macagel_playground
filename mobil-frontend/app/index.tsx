import { Redirect, Href } from 'expo-router';

export default function Index() {
  // TypeScript sayfayı henüz yeni oluşturduğumuz için tam tanımamış olabilir.
  // Bu yüzden 'as Href' ile type hatasını eziyoruz.
  return <Redirect href={"/login" as Href} />;
}