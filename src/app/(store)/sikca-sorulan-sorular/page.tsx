"use client";

import { motion } from "motion/react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "Siparişim ne kadar sürede teslim edilir?",
        answer: "Siparişleriniz, ödeme onayından sonra 1-3 iş günü içinde kargoya verilir. Kargo süresi bulunduğunuz bölgeye göre 1-3 iş günü arasında değişmektedir.",
    },
    {
        question: "Ücretsiz kargo koşulları nelerdir?",
        answer: "500 TL ve üzeri siparişlerinizde kargo ücretsizdir. 500 TL altı siparişlerde kargo ücreti 50 TL'dir.",
    },
    {
        question: "İade ve değişim politikanız nedir?",
        answer: "Tüm ürünlerimizde 14 gün koşulsuz iade hakkınız bulunmaktadır. Ürünün kullanılmamış, orijinal ambalajında ve faturasıyla birlikte iade edilmesi gerekmektedir.",
    },
    {
        question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
        answer: "Visa, MasterCard ve Troy kart ile güvenli ödeme yapabilirsiniz. 3D Secure ile korunan ödeme altyapımız sayesinde kart bilgileriniz güvende.",
    },
    {
        question: "Bisikletimi mağazadan teslim alabilir miyim?",
        answer: "Evet, sipariş verirken mağazadan teslim seçeneğini kullanabilirsiniz. Siparişiniz hazır olduğunda size bildirim gönderilecektir.",
    },
    {
        question: "Bisiklet montajı yapıyor musunuz?",
        answer: "Mağazamızdan teslim aldığınız bisikletler %100 montajlı olarak teslim edilir. Kargo ile gönderilen bisikletler ise %90 montajlı olarak gönderilir ve basit kurulum kılavuzu eklenir.",
    },
    {
        question: "Garanti kapsamı nedir?",
        answer: "Tüm bisikletlerimiz 2 yıl marka garantisi altındadır. Aksesuarlar ve yedek parçalar ise üretici garantisine tabidir.",
    },
    {
        question: "Taksitli ödeme yapabilir miyim?",
        answer: "Evet, kredi kartınıza uygun taksit seçenekleri ödeme sayfasında gösterilecektir. Taksit seçenekleri bankanıza göre farklılık gösterebilir.",
    },
];

export default function FAQPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
                    Sıkça Sorulan Sorular
                </h1>
                <p className="text-muted-foreground text-center mb-8">
                    Merak ettiklerinize hızlıca yanıt bulun.
                </p>

                <Accordion type="single" collapsible className="space-y-3">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border rounded-xl px-4"
                        >
                            <AccordionTrigger className="text-left font-medium hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </motion.div>
        </div>
    );
}
