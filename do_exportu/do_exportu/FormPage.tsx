import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  // 1. Zamawiający
  oznaczenieSpawy: string;
  nazwaZamawiajacego: string;
  
  // 2. Przedmiot zamówienia
  nazwaPrzedmiotu: string;
  
  // 3. Wartość
  wartoscZamowienia: string;
  wartoscEuro: string;
  
  // 4. Tryb podstawowy
  trybPodstawowy: string;
  
  // 5. Osoby wykonujące czynności
  osobyWykonujace: string;
  
  // 7. Ogłoszenie o zamówieniu
  dataOgloszeniaBZP: string;
  numerOgloszeniaBZP: string;
  
  // 9. SWZ
  adresSWZ: string;
  
  // 11. Termin składania ofert
  terminSkladaniaOfertData: string;
  terminSkladaniaOfertGodzina: string;
  
  // 12. Otwarcie ofert
  dataOtwarciaOfert: string;
  godzinaOtwarciaOfert: string;
  
  // 22. Najkorzystniejsza oferta
  nazwaWykonawcy: string;
  kwotaOferty: string;
  uzasadnienieWyboru: string;
  
  // 29. Udzielenie zamówienia
  dataZawarciaUmowy: string;
  wykonawcaUmowy: string;
  kwotaUmowy: string;
  
  // Ogłoszenie o wyniku
  dataOgloszeniaWyniku: string;
  numerOgloszeniaWyniku: string;
  
  // 32. Osoba sporządzająca
  osobaSPorzadzajaca: string;
  dataSporzadzenia: string;
  
  // 33. Zatwierdzenie
  osobaZatwierdzajaca: string;
  dataZatwierdzenia: string;
}

const initialFormData: FormData = {
  oznaczenieSpawy: '',
  nazwaZamawiajacego: '',
  nazwaPrzedmiotu: '',
  wartoscZamowienia: '',
  wartoscEuro: '',
  trybPodstawowy: 'bez_negocjacji',
  osobyWykonujace: '',
  dataOgloszeniaBZP: '',
  numerOgloszeniaBZP: '',
  adresSWZ: '',
  terminSkladaniaOfertData: '',
  terminSkladaniaOfertGodzina: '',
  dataOtwarciaOfert: '',
  godzinaOtwarciaOfert: '',
  nazwaWykonawcy: '',
  kwotaOferty: '',
  uzasadnienieWyboru: '',
  dataZawarciaUmowy: '',
  wykonawcaUmowy: '',
  kwotaUmowy: '',
  dataOgloszeniaWyniku: '',
  numerOgloszeniaWyniku: '',
  osobaSPorzadzajaca: '',
  dataSporzadzenia: '',
  osobaZatwierdzajaca: '',
  dataZatwierdzenia: '',
};

const FormPage = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const hasAnyData = Object.values(formData).some(value => value && value.trim() !== '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateDoc = async () => {
    if (!hasAnyData) {
      toast({
        title: "Błąd",
        description: "Wypełnij przynajmniej jedno pole formularza",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Błąd generowania dokumentu');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Protokol_Przetargu.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Sukces",
        description: "Dokument został wygenerowany i pobrany",
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować dokumentu. Upewnij się, że serwer backend jest uruchomiony.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Protokół Postępowania w Trybie Podstawowym
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FORMULARZ */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Wypełnij dane protokołu</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={["item-1"]} className="w-full">
                  
                  {/* 1. Dane podstawowe */}
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left font-semibold">
                      1. Dane podstawowe
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="oznaczenieSpawy">Oznaczenie sprawy</Label>
                        <Input
                          id="oznaczenieSpawy"
                          name="oznaczenieSpawy"
                          value={formData.oznaczenieSpawy}
                          onChange={handleChange}
                          placeholder="np. ZP/01/2025"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nazwaZamawiajacego">Pełna nazwa zamawiającego</Label>
                        <Textarea
                          id="nazwaZamawiajacego"
                          name="nazwaZamawiajacego"
                          value={formData.nazwaZamawiajacego}
                          onChange={handleChange}
                          placeholder="Pełna nazwa zamawiającego"
                          rows={2}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 2. Przedmiot zamówienia */}
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left font-semibold">
                      2. Przedmiot zamówienia
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="nazwaPrzedmiotu">Nazwa przedmiotu zamówienia</Label>
                        <Textarea
                          id="nazwaPrzedmiotu"
                          name="nazwaPrzedmiotu"
                          value={formData.nazwaPrzedmiotu}
                          onChange={handleChange}
                          placeholder="Nazwa zamówienia nadana przez zamawiającego"
                          rows={3}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 3. Wartość zamówienia */}
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left font-semibold">
                      3. Wartość zamówienia
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="wartoscZamowienia">Wartość zamówienia (zł)</Label>
                        <Input
                          id="wartoscZamowienia"
                          name="wartoscZamowienia"
                          value={formData.wartoscZamowienia}
                          onChange={handleChange}
                          placeholder="np. 150 000,00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="wartoscEuro">Równowartość w euro</Label>
                        <Input
                          id="wartoscEuro"
                          name="wartoscEuro"
                          value={formData.wartoscEuro}
                          onChange={handleChange}
                          placeholder="np. 35 000,00"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 4. Tryb podstawowy */}
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left font-semibold">
                      4. Tryb udzielenia zamówienia
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="trybPodstawowy">Tryb podstawowy</Label>
                        <Select 
                          value={formData.trybPodstawowy} 
                          onValueChange={(value) => handleSelectChange('trybPodstawowy', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz tryb" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bez_negocjacji">Bez możliwości negocjacji (art. 275 pkt 1)</SelectItem>
                            <SelectItem value="mozliwosc_negocjacji">Z możliwością negocjacji (art. 275 pkt 2)</SelectItem>
                            <SelectItem value="negocjacje">Z negocjacjami (art. 275 pkt 3)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 5. Osoby wykonujące czynności */}
                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left font-semibold">
                      5. Osoby wykonujące czynności
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="osobyWykonujace">Osoby wykonujące czynności</Label>
                        <Textarea
                          id="osobyWykonujace"
                          name="osobyWykonujace"
                          value={formData.osobyWykonujace}
                          onChange={handleChange}
                          placeholder="Imię i nazwisko, funkcja"
                          rows={3}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 6. Ogłoszenie o zamówieniu */}
                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-left font-semibold">
                      6. Ogłoszenie o zamówieniu (BZP)
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="dataOgloszeniaBZP">Data zamieszczenia w BZP</Label>
                        <Input
                          id="dataOgloszeniaBZP"
                          name="dataOgloszeniaBZP"
                          type="date"
                          value={formData.dataOgloszeniaBZP}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="numerOgloszeniaBZP">Numer ogłoszenia</Label>
                        <Input
                          id="numerOgloszeniaBZP"
                          name="numerOgloszeniaBZP"
                          value={formData.numerOgloszeniaBZP}
                          onChange={handleChange}
                          placeholder="np. 2025/BZP 00012345/01"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 7. SWZ */}
                  <AccordionItem value="item-7">
                    <AccordionTrigger className="text-left font-semibold">
                      7. Specyfikacja Warunków Zamówienia
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="adresSWZ">Adres strony z SWZ</Label>
                        <Input
                          id="adresSWZ"
                          name="adresSWZ"
                          value={formData.adresSWZ}
                          onChange={handleChange}
                          placeholder="https://..."
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 8. Termin składania ofert */}
                  <AccordionItem value="item-8">
                    <AccordionTrigger className="text-left font-semibold">
                      8. Termin składania ofert
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="terminSkladaniaOfertData">Data</Label>
                        <Input
                          id="terminSkladaniaOfertData"
                          name="terminSkladaniaOfertData"
                          type="date"
                          value={formData.terminSkladaniaOfertData}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="terminSkladaniaOfertGodzina">Godzina</Label>
                        <Input
                          id="terminSkladaniaOfertGodzina"
                          name="terminSkladaniaOfertGodzina"
                          type="time"
                          value={formData.terminSkladaniaOfertGodzina}
                          onChange={handleChange}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 9. Otwarcie ofert */}
                  <AccordionItem value="item-9">
                    <AccordionTrigger className="text-left font-semibold">
                      9. Otwarcie ofert
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="dataOtwarciaOfert">Data otwarcia</Label>
                        <Input
                          id="dataOtwarciaOfert"
                          name="dataOtwarciaOfert"
                          type="date"
                          value={formData.dataOtwarciaOfert}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="godzinaOtwarciaOfert">Godzina otwarcia</Label>
                        <Input
                          id="godzinaOtwarciaOfert"
                          name="godzinaOtwarciaOfert"
                          type="time"
                          value={formData.godzinaOtwarciaOfert}
                          onChange={handleChange}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 10. Najkorzystniejsza oferta */}
                  <AccordionItem value="item-10">
                    <AccordionTrigger className="text-left font-semibold">
                      10. Najkorzystniejsza oferta
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="nazwaWykonawcy">Nazwa wykonawcy</Label>
                        <Input
                          id="nazwaWykonawcy"
                          name="nazwaWykonawcy"
                          value={formData.nazwaWykonawcy}
                          onChange={handleChange}
                          placeholder="Nazwa firmy"
                        />
                      </div>
                      <div>
                        <Label htmlFor="kwotaOferty">Kwota oferty (zł)</Label>
                        <Input
                          id="kwotaOferty"
                          name="kwotaOferty"
                          value={formData.kwotaOferty}
                          onChange={handleChange}
                          placeholder="np. 145 000,00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="uzasadnienieWyboru">Uzasadnienie wyboru</Label>
                        <Textarea
                          id="uzasadnienieWyboru"
                          name="uzasadnienieWyboru"
                          value={formData.uzasadnienieWyboru}
                          onChange={handleChange}
                          placeholder="Uzasadnienie faktyczne i prawne wyboru"
                          rows={3}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 11. Udzielenie zamówienia */}
                  <AccordionItem value="item-11">
                    <AccordionTrigger className="text-left font-semibold">
                      11. Udzielenie zamówienia
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="dataZawarciaUmowy">Data zawarcia umowy</Label>
                        <Input
                          id="dataZawarciaUmowy"
                          name="dataZawarciaUmowy"
                          type="date"
                          value={formData.dataZawarciaUmowy}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="wykonawcaUmowy">Wykonawca (nazwa)</Label>
                        <Input
                          id="wykonawcaUmowy"
                          name="wykonawcaUmowy"
                          value={formData.wykonawcaUmowy}
                          onChange={handleChange}
                          placeholder="Nazwa wykonawcy"
                        />
                      </div>
                      <div>
                        <Label htmlFor="kwotaUmowy">Kwota umowy (zł)</Label>
                        <Input
                          id="kwotaUmowy"
                          name="kwotaUmowy"
                          value={formData.kwotaUmowy}
                          onChange={handleChange}
                          placeholder="np. 145 000,00"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 12. Ogłoszenie o wyniku */}
                  <AccordionItem value="item-12">
                    <AccordionTrigger className="text-left font-semibold">
                      12. Ogłoszenie o wyniku postępowania
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="dataOgloszeniaWyniku">Data zamieszczenia w BZP</Label>
                        <Input
                          id="dataOgloszeniaWyniku"
                          name="dataOgloszeniaWyniku"
                          type="date"
                          value={formData.dataOgloszeniaWyniku}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="numerOgloszeniaWyniku">Numer ogłoszenia</Label>
                        <Input
                          id="numerOgloszeniaWyniku"
                          name="numerOgloszeniaWyniku"
                          value={formData.numerOgloszeniaWyniku}
                          onChange={handleChange}
                          placeholder="np. 2025/BZP 00012345/01"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 13. Osoba sporządzająca */}
                  <AccordionItem value="item-13">
                    <AccordionTrigger className="text-left font-semibold">
                      13. Osoba sporządzająca protokół
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="osobaSPorzadzajaca">Imię i nazwisko</Label>
                        <Input
                          id="osobaSPorzadzajaca"
                          name="osobaSPorzadzajaca"
                          value={formData.osobaSPorzadzajaca}
                          onChange={handleChange}
                          placeholder="Imię i nazwisko"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dataSporzadzenia">Data sporządzenia</Label>
                        <Input
                          id="dataSporzadzenia"
                          name="dataSporzadzenia"
                          type="date"
                          value={formData.dataSporzadzenia}
                          onChange={handleChange}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* 14. Zatwierdzenie */}
                  <AccordionItem value="item-14">
                    <AccordionTrigger className="text-left font-semibold">
                      14. Zatwierdzenie protokołu
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="osobaZatwierdzajaca">Imię i nazwisko zatwierdzającego</Label>
                        <Input
                          id="osobaZatwierdzajaca"
                          name="osobaZatwierdzajaca"
                          value={formData.osobaZatwierdzajaca}
                          onChange={handleChange}
                          placeholder="Imię i nazwisko"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dataZatwierdzenia">Data zatwierdzenia</Label>
                        <Input
                          id="dataZatwierdzenia"
                          name="dataZatwierdzenia"
                          type="date"
                          value={formData.dataZatwierdzenia}
                          onChange={handleChange}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>

                <div className="mt-6 flex flex-col gap-4">
                  <Button 
                    onClick={handleGenerateDoc}
                    disabled={isGenerating || !hasAnyData}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generowanie...
                      </>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-5 w-5" />
                        Wygeneruj protokół (.docx)
                      </>
                    )}
                  </Button>
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setFormData(initialFormData)}
                      className="flex-1"
                    >
                      Wyczyść formularz
                    </Button>
                    <Button className="flex-1" variant="secondary">
                      Zapisz dane
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PODGLĄD DOKUMENTU */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card className="bg-white shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="text-xl">Podgląd dokumentu</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Symulacja strony A4 */}
                <div className="max-h-[80vh] overflow-y-auto">
                  <div className="bg-white p-6 shadow-inner text-xs" style={{ fontFamily: 'Times New Roman, serif' }}>
                    
                    {/* Nagłówek dokumentu */}
                    <div className="text-right mb-2">
                      <span className="text-[10px]">oznaczenie sprawy </span>
                      <span className="border-b border-dotted border-gray-400 inline-block min-w-[100px] text-center">
                        {formData.oznaczenieSpawy || '...........................'}
                      </span>
                      <span className="ml-2 font-bold">DRUK ZP-TP</span>
                    </div>

                    {/* Tytuł */}
                    <h1 className="text-center font-bold text-sm mb-4 mt-4">
                      PROTOKÓŁ POSTĘPOWANIA W TRYBIE PODSTAWOWYM
                    </h1>

                    <p className="mb-2">Protokół dotyczy:</p>
                    <p className="mb-0.5 ml-2">• zamówienia publicznego</p>
                    <p className="mb-3 ml-2">• umowy ramowej</p>

                    {/* Tabela z danymi - wszystkie 33 punkty */}
                    <table className="w-full border-collapse text-[10px] leading-tight">
                      <tbody>
                        {/* 1. Zamawiający */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">1.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Zamawiający</p>
                            <p className="mb-0.5">Pełna nazwa zamawiającego/zamawiających wspólnie przeprowadzających, w tym zamawiających z innych państw członkowskich Unii Europejskiej:</p>
                            <p className="border-b border-dotted border-gray-400 min-h-[14px]">
                              {formData.nazwaZamawiajacego || '...................................................................................................'}
                            </p>
                          </td>
                        </tr>

                        {/* 2. Przedmiot zamówienia */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">2.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Przedmiot zamówienia</p>
                            <p className="mb-0.5">Nazwa przedmiotu zamówienia/umowy ramowej:</p>
                            <p className="text-[9px] text-gray-500 mb-0.5">(podać nazwę zamówienia/umowy ramowej nadaną przez zamawiającego)</p>
                            <p className="border-b border-dotted border-gray-400 min-h-[14px]">
                              {formData.nazwaPrzedmiotu || '...................................................................................................'}
                            </p>
                          </td>
                        </tr>

                        {/* 3. Wartość */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">3.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Wartość <span className="font-normal text-[9px]">(można wypełnić po otwarciu ofert)</span></p>
                            <p className="mb-0.5">
                              • zamówienia <span className="border-b border-dotted border-gray-400 inline-block min-w-[60px] text-center">
                                {formData.wartoscZamowienia || '.........................'}
                              </span> zł, co stanowi równowartość <span className="border-b border-dotted border-gray-400 inline-block min-w-[50px] text-center">
                                {formData.wartoscEuro || '......................'}
                              </span> euro
                            </p>
                            <p className="mb-0.5">• zamówień (w przypadku dopuszczenia możliwości składania ofert częściowych) z podziałem na części:</p>
                            <p className="mb-0.5 ml-2">1) ......... 2) ......... 3) .........</p>
                            <p className="mb-0.5">• zamówienia udzielanego jako część zamówienia o wartości ................... zł</p>
                          </td>
                        </tr>

                        {/* 4. Wstępne konsultacje rynkowe */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">4.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Wstępne konsultacje rynkowe/wcześniejsze zaangażowanie wykonawcy</p>
                            <p className="mb-0.5">Przeprowadzono wstępne konsultacje rynkowe, o których mowa w art. 84 ustawy:</p>
                            <p className="mb-0.5">• nie</p>
                            <p className="mb-0.5">• tak <span className="text-[9px] text-gray-500">(wypełnić poniżej w przypadku zaznaczenia odpowiedzi „tak")</span></p>
                            <p className="mb-0.5">Wskazać podmioty, które uczestniczyły: .................................................................</p>
                          </td>
                        </tr>

                        {/* 5. Tryb podstawowy */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">5.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Zamawiający udziela zamówienia w trybie podstawowym:</p>
                            <p className={`mb-0.5 ${formData.trybPodstawowy === 'bez_negocjacji' ? 'font-bold underline' : ''}`}>
                              • bez możliwości negocjacji, na podstawie art. 275 pkt 1 ustawy
                            </p>
                            <p className={`mb-0.5 ${formData.trybPodstawowy === 'mozliwosc_negocjacji' ? 'font-bold underline' : ''}`}>
                              • z możliwością negocjacji, na podstawie art. 275 pkt 2 ustawy
                            </p>
                            <p className={`mb-0.5 ${formData.trybPodstawowy === 'negocjacje' ? 'font-bold underline' : ''}`}>
                              • z negocjacjami, na podstawie art. 275 pkt 3 ustawy
                            </p>
                          </td>
                        </tr>

                        {/* 6. Osoby wykonujące czynności */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">6.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Osoby wykonujące czynności związane z przeprowadzeniem postępowania</p>
                            <p className="mb-0.5 text-[9px]">(jeżeli czynności związane z przeprowadzeniem postępowania lub mogące wpłynąć na wynik postępowania, wykonuje kierownik zamawiającego...)</p>
                            <p className="mb-0.5">A. Imiona i nazwiska osób wykonujących czynności:</p>
                            <p className="border-b border-dotted border-gray-400 min-h-[14px]">
                              {formData.osobyWykonujace || '...................................................................................................'}
                            </p>
                            <p className="mb-0.5 mt-1">B. Oświadczenia, o których mowa w art. 56 ust. 4 ustawy:</p>
                            <p className="mb-0.5">• złożono oświadczenia</p>
                            <p className="mb-0.5">• nie złożono oświadczeń</p>
                            <p className="mb-0.5 mt-1">C. Komisja przetargowa:</p>
                            <p className="mb-0.5">• została powołana w dniu ...........</p>
                            <p className="mb-0.5">• nie została powołana</p>
                            <p className="mb-0.5 mt-1">D. Informacje o istnieniu okoliczności, o których mowa w art. 56 ust. 2 ustawy:</p>
                            <p className="border-b border-dotted border-gray-400 min-h-[14px]">................................................................................................</p>
                          </td>
                        </tr>

                        {/* 7. Ogłoszenie o zamówieniu */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">7.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Ogłoszenie o zamówieniu</p>
                            <p className="mb-0.5">
                              1. Ogłoszenie o zamówieniu zostało zamieszczone w BZP w dniu <span className="border-b border-dotted border-gray-400 inline-block min-w-[70px] text-center">
                                {formData.dataOgloszeniaBZP ? new Date(formData.dataOgloszeniaBZP).toLocaleDateString('pl-PL') : '..........................'}
                              </span> r., pod nr <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px] text-center">
                                {formData.numerOgloszeniaBZP || '.................'}
                              </span>
                            </p>
                            <p className="mb-0.5 text-[9px] text-gray-500">(załączyć dowód zamieszczenia ogłoszenia w BZP)</p>
                            <p className="mb-0.5 mt-1">2. Zmiana treści ogłoszenia:</p>
                            <p className="mb-0.5">• nie zmieniono treści ogłoszenia</p>
                            <p className="mb-0.5">• zmieniono treść ogłoszenia w dniu ................... (załączyć dowód)</p>
                          </td>
                        </tr>

                        {/* 8. Powody odstąpienia */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">8.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Powody odstąpienia od wymogu użycia środków komunikacji elektronicznej</p>
                            <p className="text-[9px] text-gray-500 mb-0.5">(podać podstawę prawną i uzasadnienie faktyczne oraz czego dotyczy odstąpienie)</p>
                            <p className="border-b border-dotted border-gray-400 min-h-[14px]">...................................................................................................</p>
                          </td>
                        </tr>

                        {/* 9. SWZ */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">9.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Specyfikacja warunków zamówienia (SWZ)</p>
                            <p className="text-[9px] text-gray-500 mb-0.5">(dotyczy trybu podstawowego, o którym mowa w art. 275 pkt 1 i 2 ustawy)</p>
                            <p className="mb-0.5">SWZ została udostępniona na stronie internetowej prowadzonego postępowania (podać adres strony):</p>
                            <p className="border-b border-dotted border-gray-400 min-h-[14px]">
                              {formData.adresSWZ || '...................................................................................................'}
                            </p>
                          </td>
                        </tr>

                        {/* 10. Opis potrzeb i wymagań */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">10.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Opis potrzeb i wymagań oraz SWZ</p>
                            <p className="text-[9px] text-gray-500 mb-0.5">(dotyczy trybu podstawowego, o którym mowa w art. 275 pkt 3)</p>
                            <p className="mb-0.5">1. Opis potrzeb i wymagań został udostępniony na stronie internetowej: ...............</p>
                            <p className="mb-0.5">2. SWZ została udostępniona na stronie internetowej od dnia: ...............</p>
                          </td>
                        </tr>

                        {/* 11. Termin składania ofert */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">11.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Sposób i termin składania ofert</p>
                            <p className="text-[9px] text-gray-500 mb-0.5">(dotyczy ofert składanych w odpowiedzi na ogłoszenie o zamówieniu)</p>
                            <p className="mb-0.5">
                              1. Termin składania ofert upłynął w dniu <span className="border-b border-dotted border-gray-400 inline-block min-w-[70px] text-center">
                                {formData.terminSkladaniaOfertData ? new Date(formData.terminSkladaniaOfertData).toLocaleDateString('pl-PL') : '................'}
                              </span> r. o godz. <span className="border-b border-dotted border-gray-400 inline-block min-w-[30px] text-center">
                                {formData.terminSkladaniaOfertGodzina || '......'}
                              </span>
                            </p>
                            <p className="mb-0.5">2. Wymóg składania ofert wyłącznie przy użyciu środków komunikacji elektronicznej:</p>
                            <p className="mb-0.5">• zachowano wymóg</p>
                            <p className="mb-0.5">• nie zachowano wymogu (podać przyczynę): ...................</p>
                          </td>
                        </tr>

                        {/* 12. Otwarcie ofert */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">12.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Otwarcie ofert</p>
                            <p className="text-[9px] text-gray-500 mb-0.5">(dotyczy ofert składanych w odpowiedzi na ogłoszenie o zamówieniu)</p>
                            <p className="mb-0.5">1. W postępowaniu:</p>
                            <p className="mb-0.5">• nie wpłynęła żadna oferta</p>
                            <p className="mb-0.5">• wpłynęły oferty</p>
                            <p className="mb-0.5">
                              2. Otwarcie ofert nastąpiło w dniu <span className="border-b border-dotted border-gray-400 inline-block min-w-[70px] text-center">
                                {formData.dataOtwarciaOfert ? new Date(formData.dataOtwarciaOfert).toLocaleDateString('pl-PL') : '.....................'}
                              </span> r. o godz. <span className="border-b border-dotted border-gray-400 inline-block min-w-[30px] text-center">
                                {formData.godzinaOtwarciaOfert || '....'}
                              </span>
                            </p>
                          </td>
                        </tr>

                        {/* 13. Zestawienie ofert */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">13.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Zestawienie ofert</p>
                            <p className="text-[9px] text-gray-500 mb-0.5">(dotyczy ofert składanych w odpowiedzi na ogłoszenie o zamówieniu)</p>
                            <p className="mb-0.5">Do upływu terminu składania ofert złożono następujące oferty:</p>
                            <table className="w-full border-collapse text-[9px] mt-1">
                              <thead>
                                <tr>
                                  <th className="border border-gray-300 p-0.5 w-6">Nr</th>
                                  <th className="border border-gray-300 p-0.5">Nazwa wykonawcy</th>
                                  <th className="border border-gray-300 p-0.5">Cena/koszt</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr><td className="border border-gray-300 p-0.5">1.</td><td className="border border-gray-300 p-0.5">..................</td><td className="border border-gray-300 p-0.5">........</td></tr>
                                <tr><td className="border border-gray-300 p-0.5">2.</td><td className="border border-gray-300 p-0.5">..................</td><td className="border border-gray-300 p-0.5">........</td></tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>

                        {/* 14. Oferty odrzucone */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">14.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Oferty odrzucone</p>
                            <p className="mb-0.5">Odrzucono oferty:</p>
                            <p className="mb-0.5">• nie</p>
                            <p className="mb-0.5">• tak, odrzucono oferty następujących wykonawców:</p>
                            <p className="mb-0.5 ml-2">1. ........................... Podstawa prawna i powód: ...........................</p>
                          </td>
                        </tr>

                        {/* 15. Ograniczenie liczby wykonawców */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">15.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Ograniczenie liczby wykonawców zaproszonych do negocjacji</p>
                            <p className="text-[9px] text-gray-500 mb-0.5">(dotyczy trybu podstawowego, o którym mowa w art. 275 pkt 2 i 3 ustawy)</p>
                            <p className="mb-0.5">Zaproszono do negocjacji następujących wykonawców: .................................</p>
                          </td>
                        </tr>

                        {/* 16. Negocjacje */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">16.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Negocjacje</p>
                            <p className="text-[9px] text-gray-500 mb-0.5">(dotyczy trybu podstawowego, o którym mowa w art. 275 pkt 2 i 3 ustawy)</p>
                            <p className="mb-0.5">1. Zaproszenie do negocjacji zostało przekazane w dniu ......</p>
                            <p className="mb-0.5">2. Negocjacje odbyły się w dniu .........</p>
                          </td>
                        </tr>

                        {/* 17. Zaproszenie do składania ofert */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">17.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Zaproszenie do składania ofert dodatkowych/ofert ostatecznych</p>
                            <p className="text-[9px] text-gray-500 mb-0.5">(dotyczy trybu podstawowego, o którym mowa w art. 275 pkt 2 i 3 ustawy)</p>
                            <p className="mb-0.5">Zaproszenie zostało przekazane w dniu ..................</p>
                          </td>
                        </tr>

                        {/* 18. Miejsce i termin składania ofert dodatkowych */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">18.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Miejsce i termin składania ofert dodatkowych/ofert ostatecznych</p>
                            <p className="mb-0.5">Termin składania ofert upłynął w dniu .............. r. o godz. ..........</p>
                          </td>
                        </tr>

                        {/* 19. Otwarcie ofert dodatkowych */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">19.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Otwarcie ofert dodatkowych/ofert ostatecznych</p>
                            <p className="mb-0.5">1. W postępowaniu: • nie wpłynęła żadna oferta • wpłynęły oferty</p>
                            <p className="mb-0.5">2. Otwarcie nastąpiło w dniu .............. r. o godz. ..........</p>
                          </td>
                        </tr>

                        {/* 20. Zestawienie ofert dodatkowych */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">20.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Zestawienie ofert dodatkowych/ofert ostatecznych</p>
                            <p className="mb-0.5">Do upływu terminu składania ofert złożono następujące oferty: ...................</p>
                          </td>
                        </tr>

                        {/* 21. Oferty odrzucone (dodatkowe) */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">21.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Oferty odrzucone</p>
                            <p className="text-[9px] text-gray-500 mb-0.5">(dotyczy ofert dodatkowych/ostatecznych)</p>
                            <p className="mb-0.5">• nie odrzucono ofert</p>
                            <p className="mb-0.5">• tak, odrzucono oferty: ...........................</p>
                          </td>
                        </tr>

                        {/* 22. Najkorzystniejsza oferta */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">22.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Najkorzystniejsza oferta</p>
                            <p className="mb-0.5">1. Zastosowanie aukcji elektronicznej:</p>
                            <p className="mb-0.5">• nie zostało przewidziane</p>
                            <p className="mb-0.5">• zostało przewidziane</p>
                            <p className="mb-0.5 mt-1">Najkorzystniejszą ofertę wybrano:</p>
                            <p className="mb-0.5">• z zastosowaniem aukcji elektronicznej</p>
                            <p className="mb-0.5">• bez zastosowania aukcji elektronicznej</p>
                            <p className="mb-0.5 mt-1">
                              2. Jako najkorzystniejszą wybrano ofertę wykonawcy: <span className="border-b border-dotted border-gray-400 inline-block min-w-[100px]">
                                {formData.nazwaWykonawcy || '.......................................'}
                              </span>
                            </p>
                            <p className="mb-0.5">
                              na kwotę: <span className="border-b border-dotted border-gray-400 inline-block min-w-[60px] text-center">
                                {formData.kwotaOferty || '.........................'}
                              </span> zł
                            </p>
                            <p className="mb-0.5">Uzasadnienie wyboru: {formData.uzasadnienieWyboru || '......................................'}</p>
                          </td>
                        </tr>

                        {/* 23. Unieważnienie postępowania */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">23.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Unieważnienie postępowania <span className="font-normal text-[9px]">(jeżeli dotyczy)</span></p>
                            <p className="mb-0.5">Powody unieważnienia (podać podstawę prawną i uzasadnienie faktyczne):</p>
                            <p className="border-b border-dotted border-gray-400 min-h-[14px]">...................................................................................................</p>
                          </td>
                        </tr>

                        {/* 24. Zatwierdzenie prac komisji */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">24.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Zatwierdzenie prac komisji przetargowej/osób wykonujących czynności</p>
                            <p className="mb-0.5">Prace • komisji przetargowej • osób wykonujących czynności związane z przeprowadzeniem postępowania zakończyły się w dniu ..................</p>
                          </td>
                        </tr>

                        {/* 25. Zawiadomienie o wyborze */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">25.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Zawiadomienie o wyborze najkorzystniejszej oferty/unieważnieniu postępowania</p>
                            <p className="mb-0.5">Zawiadomienie o:</p>
                            <p className="mb-0.5">• wyborze najkorzystniejszej oferty</p>
                            <p className="mb-0.5">• unieważnieniu postępowania</p>
                            <p className="mb-0.5">zostało przesłane w dniu ................ r. w sposób: ...................................</p>
                          </td>
                        </tr>

                        {/* 26. Środki ochrony prawnej */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">26.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Środki ochrony prawnej</p>
                            <p className="mb-0.5">1. W trakcie postępowania:</p>
                            <p className="mb-0.5">• nie wniesiono odwołania</p>
                            <p className="mb-0.5">• wykonawca ............................... wniósł odwołanie w dniu ...................... r., na ..........................................</p>
                          </td>
                        </tr>

                        {/* 27. Czynności nowe/powtórzone */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">27.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Czynności nowe/czynności powtórzone</p>
                            <p className="mb-0.5">• nie dokonano nowych czynności/nie powtórzono czynności</p>
                            <p className="mb-0.5">• dokonano nowych czynności/powtórzono następujące czynności:</p>
                            <p className="border-b border-dotted border-gray-400 min-h-[14px]">.............................................................................................</p>
                          </td>
                        </tr>

                        {/* 28. Zatwierdzenie po dokonaniu czynności */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">28.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Zatwierdzenie po dokonaniu czynności nowych/czynności powtórzonych</p>
                            <p className="mb-0.5">1. Prace • komisji przetargowej • osób wykonujących czynności zakończyły się w dniu ............... r.</p>
                            <p className="mb-0.5">1) ............... 2) ...............</p>
                          </td>
                        </tr>

                        {/* 29. Udzielenie zamówienia */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">29.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Udzielenie zamówienia</p>
                            <p className="mb-0.5">
                              1. Umowa/umowa ramowa została zawarta w dniu <span className="border-b border-dotted border-gray-400 inline-block min-w-[60px] text-center">
                                {formData.dataZawarciaUmowy ? new Date(formData.dataZawarciaUmowy).toLocaleDateString('pl-PL') : '...............'}
                              </span> r., z <span className="border-b border-dotted border-gray-400 inline-block min-w-[100px]">
                                {formData.wykonawcaUmowy || '.......................................'}
                              </span>
                            </p>
                            <p className="mb-0.5">
                              na kwotę <span className="border-b border-dotted border-gray-400 inline-block min-w-[60px] text-center">
                                {formData.kwotaUmowy || '.........................'}
                              </span> zł
                            </p>
                            <p className="mb-0.5 mt-1">
                              2. Ogłoszenie o wyniku postępowania zostało zamieszczone w BZP w dniu <span className="border-b border-dotted border-gray-400 inline-block min-w-[60px] text-center">
                                {formData.dataOgloszeniaWyniku ? new Date(formData.dataOgloszeniaWyniku).toLocaleDateString('pl-PL') : '..............'}
                              </span> r. pod nr <span className="border-b border-dotted border-gray-400 inline-block min-w-[80px] text-center">
                                {formData.numerOgloszeniaWyniku || '.................'}
                              </span>
                            </p>
                            <p className="text-[9px] text-gray-500">(załączyć dowód zamieszczenia ogłoszenia w BZP)</p>
                          </td>
                        </tr>

                        {/* 30. Załączniki do protokołu */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">30.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Załączniki do protokołu</p>
                            <p className="mb-0.5">Następujące dokumenty stanowią załączniki do protokołu: (wymienić wszystkie załączniki)</p>
                            <p className="mb-0.5">1. ................................................................................................</p>
                            <p className="mb-0.5">2. ................................................................................................</p>
                            <p className="mb-0.5">3. ................................................................................................</p>
                          </td>
                        </tr>

                        {/* 31. Uwagi do protokołu */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">31.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Uwagi do protokołu</p>
                            <p className="mb-0.5">1. Osoby wykonujące czynności związane z przeprowadzeniem postępowania:</p>
                            <p className="mb-0.5">• nie zapoznały się z treścią protokołu (podać imię i nazwisko)</p>
                            <p className="mb-0.5 ml-2">1) ........................... 2) ...........................</p>
                            <p className="mb-0.5">• zapoznały się z treścią protokołu i wnoszą następujące uwagi:</p>
                            <p className="border-b border-dotted border-gray-400 min-h-[14px]">................................................................................................</p>
                          </td>
                        </tr>

                        {/* 32. Osoba sporządzająca protokół */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">32.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Osoba sporządzająca protokół</p>
                            <p className="mb-0.5">
                              Protokół sporządził: <span className="border-b border-dotted border-gray-400 inline-block min-w-[150px]">
                                {formData.osobaSPorzadzajaca || '......................................................................................'}
                              </span>
                            </p>
                            <p className="text-[9px] text-gray-500">(imię i nazwisko osoby sporządzającej protokół)</p>
                            {formData.dataSporzadzenia && (
                              <p className="mt-1">Data: {new Date(formData.dataSporzadzenia).toLocaleDateString('pl-PL')}</p>
                            )}
                          </td>
                        </tr>

                        {/* 33. Zatwierdzenie protokołu */}
                        <tr className="border border-gray-400">
                          <td className="border border-gray-400 p-1.5 w-6 align-top font-bold">33.</td>
                          <td className="border border-gray-400 p-1.5">
                            <p className="font-bold mb-1">Zatwierdzenie protokołu</p>
                            <p className="mb-0.5">
                              <span className="border-b border-dotted border-gray-400 inline-block min-w-[200px]">
                                {formData.osobaZatwierdzajaca || '...........................................................................................................'}
                              </span>
                            </p>
                            <p className="text-[9px] text-gray-500">(imię i nazwisko kierownika zamawiającego/pracownika zamawiającego, któremu kierownik powierzył pisemnie wykonanie zastrzeżonych dla siebie czynności)</p>
                            {formData.dataZatwierdzenia && (
                              <p className="mt-1">Data: {new Date(formData.dataZatwierdzenia).toLocaleDateString('pl-PL')}</p>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Stopka */}
                    <div className="border-t border-gray-300 pt-2 mt-4 text-center text-[9px] text-gray-500">
                      <p>..................................................................</p>
                      <p>numer strony &nbsp;&nbsp;&nbsp; (podpis osoby sporządzającej protokół)</p>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
