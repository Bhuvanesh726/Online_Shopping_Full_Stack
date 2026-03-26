package com.shopease.config;

import com.shopease.model.*;
import com.shopease.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE products DROP COLUMN active");
            log.info("Dropped legacy active column from products table");
        } catch (Exception e) {
            log.info("Legacy active column already dropped or does not exist");
        }

        log.info("Initializing users...");
        initUsers();

        if (categoryRepository.count() == 0) {
            log.info("Initializing categories and products...");
            initCategories();
            initProducts();
        }
        log.info("Initialization complete!");
    }

    private void initCategories() {
        List<Category> categories = List.of(
                Category.builder().name("Electronics").description("Smartphones, laptops, gadgets and more")
                        .imageUrl("https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400").build(),
                Category.builder().name("Fashion").description("Clothing, shoes, and accessories")
                        .imageUrl("https://images.unsplash.com/photo-1445205170230-053b83016050?w=400").build(),
                Category.builder().name("Home & Living").description("Furniture, decor, and kitchen essentials")
                        .imageUrl("https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400").build(),
                Category.builder().name("Books").description("Bestsellers, educational, and fiction")
                        .imageUrl("https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400").build(),
                Category.builder().name("Sports & Fitness").description("Equipment, apparel, and accessories")
                        .imageUrl("https://images.unsplash.com/photo-1461896836934-bd45ba8a0a58?w=400").build(),
                Category.builder().name("Beauty & Health").description("Skincare, wellness, and personal care")
                        .imageUrl("https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400").build());
        categoryRepository.saveAll(categories);
    }

    private void initUsers() {
        if (!userRepository.existsByEmail("seller@shopease.com")) {
            User seller = User.builder()
                    .name("ShopEase Store")
                    .email("seller@shopease.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(User.Role.SELLER)
                    .build();
            userRepository.save(seller);
        }

        if (!userRepository.existsByEmail("buyer@shopease.com")) {
            User buyer = User.builder()
                    .name("Demo Buyer")
                    .email("buyer@shopease.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(User.Role.BUYER)
                    .build();
            userRepository.save(buyer);
        }

        User admin = userRepository.findByEmail("Bhuvanesh").orElse(new User());
        admin.setName("Bhuvanesh");
        admin.setEmail("Bhuvanesh");
        admin.setPassword(passwordEncoder.encode("Bhuvanesh"));
        admin.setRole(User.Role.ADMIN);
        userRepository.save(admin);
    }

    private void initProducts() {
        User seller = userRepository.findByEmail("seller@shopease.com").orElseThrow();
        Category electronics = categoryRepository.findByName("Electronics").orElseThrow();
        Category fashion = categoryRepository.findByName("Fashion").orElseThrow();
        Category home = categoryRepository.findByName("Home & Living").orElseThrow();
        Category books = categoryRepository.findByName("Books").orElseThrow();
        Category sports = categoryRepository.findByName("Sports & Fitness").orElseThrow();
        Category beauty = categoryRepository.findByName("Beauty & Health").orElseThrow();

        List<Product> products = List.of(
                // Electronics
                Product.builder().name("Wireless Bluetooth Headphones").description(
                        "Premium noise-cancelling headphones with 30-hour battery life. Features active noise cancellation, comfortable over-ear design, and crystal-clear audio quality.")
                        .price(new BigDecimal("79.99")).discountPrice(new BigDecimal("59.99"))
                        .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500").stock(150)
                        .brand("SoundPro").rating(new BigDecimal("4.50")).reviewCount(128).category(electronics)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Smart Watch Pro").description(
                        "Advanced fitness tracker with heart rate monitor, GPS, and water resistance. Track your health metrics and stay connected on the go.")
                        .price(new BigDecimal("199.99")).discountPrice(new BigDecimal("149.99"))
                        .imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500").stock(80)
                        .brand("TechWear").rating(new BigDecimal("4.30")).reviewCount(95).category(electronics)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Portable Bluetooth Speaker").description(
                        "Waterproof wireless speaker with deep bass and 12-hour playtime. Perfect for outdoor adventures and pool parties.")
                        .price(new BigDecimal("49.99"))
                        .imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500").stock(200)
                        .brand("SoundPro").rating(new BigDecimal("4.20")).reviewCount(67).category(electronics)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Laptop Stand Adjustable").description(
                        "Ergonomic aluminum laptop stand with adjustable height. Improves posture and enhances airflow for your device.")
                        .price(new BigDecimal("39.99")).discountPrice(new BigDecimal("29.99"))
                        .imageUrl("https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500").stock(300)
                        .brand("DeskMate").rating(new BigDecimal("4.60")).reviewCount(210).category(electronics)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Wireless Charging Pad").description(
                        "Fast wireless charger compatible with all Qi-enabled devices. Sleek design with LED indicator and anti-slip surface.")
                        .price(new BigDecimal("24.99"))
                        .imageUrl("https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500").stock(500)
                        .brand("ChargeTech").rating(new BigDecimal("4.10")).reviewCount(45).category(electronics)
                        .seller(seller).status(Product.Status.ACTIVE).build(),

                // Fashion
                Product.builder().name("Classic Leather Watch").description(
                        "Elegant leather strap watch with minimalist dial design. Genuine Italian leather band with stainless steel case.")
                        .price(new BigDecimal("129.99")).discountPrice(new BigDecimal("99.99"))
                        .imageUrl("https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500").stock(60)
                        .brand("TimeStyle").rating(new BigDecimal("4.70")).reviewCount(89).category(fashion)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Canvas Backpack").description(
                        "Durable and stylish canvas backpack with laptop compartment. Perfect for work, school, or travel with multiple pockets.")
                        .price(new BigDecimal("59.99")).discountPrice(new BigDecimal("44.99"))
                        .imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500").stock(120)
                        .brand("UrbanPack").rating(new BigDecimal("4.40")).reviewCount(156).category(fashion)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Sunglasses UV Protection").description(
                        "Polarized sunglasses with UV400 protection. Lightweight frame with premium lens quality for all-day comfort.")
                        .price(new BigDecimal("34.99"))
                        .imageUrl("https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500").stock(250)
                        .brand("SunVibe").rating(new BigDecimal("4.00")).reviewCount(78).category(fashion)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Premium Sneakers").description(
                        "Comfortable athletic sneakers with breathable mesh upper. Cushioned sole for all-day support and style.")
                        .price(new BigDecimal("89.99")).discountPrice(new BigDecimal("69.99"))
                        .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500").stock(90)
                        .brand("StrideX").rating(new BigDecimal("4.50")).reviewCount(200).category(fashion)
                        .seller(seller).status(Product.Status.ACTIVE).build(),

                // Home & Living
                Product.builder().name("Scented Candle Set").description(
                        "Set of 3 premium soy wax candles with calming scents. Long-lasting burn time of 45+ hours each.")
                        .price(new BigDecimal("29.99")).discountPrice(new BigDecimal("22.99"))
                        .imageUrl("https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=500").stock(180)
                        .brand("AromaHome").rating(new BigDecimal("4.60")).reviewCount(134).category(home)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Indoor Plant Pot Set").description(
                        "Modern ceramic plant pots in varying sizes. Minimalist design with drainage hole and bamboo tray.")
                        .price(new BigDecimal("44.99"))
                        .imageUrl("https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500").stock(100)
                        .brand("GreenSpace").rating(new BigDecimal("4.30")).reviewCount(56).category(home)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Throw Blanket Knitted").description(
                        "Soft and cozy knitted throw blanket. Perfect for your couch or bed. Machine washable and hypoallergenic.")
                        .price(new BigDecimal("39.99")).discountPrice(new BigDecimal("32.99"))
                        .imageUrl("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500").stock(150)
                        .brand("CozyNest").rating(new BigDecimal("4.80")).reviewCount(245).category(home).seller(seller)
                        .status(Product.Status.ACTIVE).build(),

                // Books
                Product.builder().name("The Art of Mindfulness").description(
                        "A comprehensive guide to mindful living and meditation practices. Includes practical exercises for daily well-being.")
                        .price(new BigDecimal("16.99"))
                        .imageUrl("https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500").stock(400)
                        .brand("WisdomPress").rating(new BigDecimal("4.50")).reviewCount(312).category(books)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Modern Cooking Essentials").description(
                        "Over 200 delicious recipes with step-by-step instructions. From quick weekday meals to gourmet weekend dishes.")
                        .price(new BigDecimal("24.99")).discountPrice(new BigDecimal("19.99"))
                        .imageUrl("https://images.unsplash.com/photo-1589998059171-988d887df646?w=500").stock(200)
                        .brand("ChefBooks").rating(new BigDecimal("4.40")).reviewCount(167).category(books)
                        .seller(seller).status(Product.Status.ACTIVE).build(),

                // Sports
                Product.builder().name("Yoga Mat Premium").description(
                        "Extra thick non-slip yoga mat with alignment lines. Eco-friendly TPE material with carrying strap included.")
                        .price(new BigDecimal("34.99")).discountPrice(new BigDecimal("27.99"))
                        .imageUrl("https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500").stock(220)
                        .brand("FlexFit").rating(new BigDecimal("4.60")).reviewCount(189).category(sports)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Stainless Steel Water Bottle").description(
                        "Double-wall insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and leak-proof.")
                        .price(new BigDecimal("22.99"))
                        .imageUrl("https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500").stock(350)
                        .brand("HydroLife").rating(new BigDecimal("4.40")).reviewCount(276).category(sports)
                        .seller(seller).status(Product.Status.ACTIVE).build(),

                // Beauty
                Product.builder().name("Natural Skincare Kit").description(
                        "Complete skincare routine set with cleanser, toner, serum, and moisturizer. Made with organic ingredients.")
                        .price(new BigDecimal("54.99")).discountPrice(new BigDecimal("42.99"))
                        .imageUrl("https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500").stock(130)
                        .brand("PureGlow").rating(new BigDecimal("4.70")).reviewCount(198).category(beauty)
                        .seller(seller).status(Product.Status.ACTIVE).build(),
                Product.builder().name("Essential Oil Diffuser").description(
                        "Ultrasonic aromatherapy diffuser with color-changing LED lights. Covers up to 300 sq ft with whisper-quiet operation.")
                        .price(new BigDecimal("29.99"))
                        .imageUrl("https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500").stock(170)
                        .brand("AromaHome").rating(new BigDecimal("4.30")).reviewCount(112).category(beauty)
                        .seller(seller).status(Product.Status.ACTIVE).build());

        productRepository.saveAll(products);
    }
}
