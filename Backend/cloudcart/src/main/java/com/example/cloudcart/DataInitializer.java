package com.example.cloudcart;

import com.example.cloudcart.entity.Product;
import com.example.cloudcart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) return;

        productRepository.saveAll(List.of(
                Product.builder()
                        .name("Notebook Dell Inspiron 15")
                        .description("Intel Core i5 12ª geração, 8GB RAM, 256GB SSD, tela 15.6\" Full HD. Ideal para trabalho e estudo.")
                        .category("Computadores")
                        .price(new BigDecimal("3499.00"))
                        .stockQuantity(10)
                        .build(),

                Product.builder()
                        .name("Smartphone Samsung Galaxy A55")
                        .description("Tela AMOLED 6.6\", Exynos 1480, 8GB RAM, 256GB, câmera tripla 50MP, bateria 5000mAh.")
                        .category("Smartphones")
                        .price(new BigDecimal("2199.00"))
                        .stockQuantity(5)
                        .build(),

                Product.builder()
                        .name("Monitor LG 24\" Full HD")
                        .description("Painel IPS 24 polegadas, 1920x1080, 75Hz, tempo de resposta 5ms, entradas HDMI e VGA.")
                        .category("Periféricos")
                        .price(new BigDecimal("1199.00"))
                        .stockQuantity(8)
                        .build(),

                Product.builder()
                        .name("Mouse Logitech MX Master 3")
                        .description("Mouse ergonômico sem fio, sensor de 4000 DPI, scroll MagSpeed, bateria de longa duração.")
                        .category("Periféricos")
                        .price(new BigDecimal("449.00"))
                        .stockQuantity(25)
                        .build(),

                Product.builder()
                        .name("Teclado Mecânico Redragon K552")
                        .description("Switch Red, layout compacto TKL, retroiluminação RGB, construção robusta em metal.")
                        .category("Periféricos")
                        .price(new BigDecimal("299.00"))
                        .stockQuantity(18)
                        .build(),

                Product.builder()
                        .name("Headset HyperX Cloud II")
                        .description("Som surround virtual 7.1, drivers de 53mm, microfone removível com cancelamento de ruído.")
                        .category("Áudio & Vídeo")
                        .price(new BigDecimal("399.00"))
                        .stockQuantity(20)
                        .build(),

                Product.builder()
                        .name("SSD Kingston A400 480GB")
                        .description("Interface SATA III, leitura até 500MB/s, gravação até 450MB/s, fator de forma 2.5\".")
                        .category("Armazenamento")
                        .price(new BigDecimal("249.00"))
                        .stockQuantity(35)
                        .build(),

                Product.builder()
                        .name("Webcam Logitech C920 HD Pro")
                        .description("Full HD 1080p a 30fps, autofoco rápido, dois microfones integrados, compatível com Zoom e Teams.")
                        .category("Periféricos")
                        .price(new BigDecimal("599.00"))
                        .stockQuantity(12)
                        .build(),

                Product.builder()
                        .name("Hub USB-C 7 em 1")
                        .description("3x USB-A 3.0, HDMI 4K, leitor SD/MicroSD, entrega de energia 100W. Compatível com MacBook e notebooks.")
                        .category("Acessórios")
                        .price(new BigDecimal("189.00"))
                        .stockQuantity(40)
                        .build(),

                Product.builder()
                        .name("Mochila para Notebook 15.6\"")
                        .description("Material resistente à água, compartimento acolchoado, porta USB externa para carregamento, 25 litros.")
                        .category("Acessórios")
                        .price(new BigDecimal("159.00"))
                        .stockQuantity(50)
                        .build(),

                Product.builder()
                        .name("Pendrive Kingston 64GB USB 3.2")
                        .description("Velocidade de leitura até 200MB/s, compacto e resistente, tampa protetora, compatível com USB 2.0.")
                        .category("Armazenamento")
                        .price(new BigDecimal("49.90"))
                        .stockQuantity(100)
                        .build(),

                Product.builder()
                        .name("Suporte Articulado para Monitor")
                        .description("Suporte de mesa com braço articulado, ajuste de altura e ângulo, compatível com monitores de 13\" a 32\".")
                        .category("Acessórios")
                        .price(new BigDecimal("219.00"))
                        .stockQuantity(3)
                        .build()
        ));
    }
}
