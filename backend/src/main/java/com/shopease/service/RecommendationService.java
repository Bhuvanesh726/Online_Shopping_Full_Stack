package com.shopease.service;

import com.shopease.dto.ProductDto;
import com.shopease.model.Product;
import com.shopease.model.User;
import com.shopease.repository.ProductRepository;
import com.shopease.repository.UserPreferenceRepository;
import com.google.gson.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final ProductRepository productRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final ProductService productService;

    public List<ProductDto.ProductResponse> getPersonalizedRecommendations(User user) {
        try {
            // Get user preferences
            List<Long> topCategoryIds = userPreferenceRepository.findTopCategoryIdsByUserId(user.getId());
            List<Long> topProductIds = userPreferenceRepository.findTopProductIdsByUserId(user.getId());

            // Get candidate products
            List<Product> allProducts = productRepository.findByActiveTrue(
                    org.springframework.data.domain.PageRequest.of(0, 50)).getContent();

            if (allProducts.isEmpty()) {
                return List.of();
            }

            // Build product info for Gemini
            StringBuilder productInfo = new StringBuilder();
            for (Product p : allProducts) {
                productInfo.append(String.format("ID:%d, Name:%s, Category:%s, Price:$%.2f, Rating:%.1f\n",
                        p.getId(), p.getName(),
                        p.getCategory() != null ? p.getCategory().getName() : "General",
                        p.getPrice(), p.getRating()));
            }

            String userContext = "User has shown interest in categories: " +
                    (topCategoryIds.isEmpty() ? "none yet" : topCategoryIds.toString()) +
                    " and products: " +
                    (topProductIds.isEmpty() ? "none yet" : topProductIds.toString());

            // Call Gemini API
            List<Long> recommendedIds = callGeminiForRecommendations(productInfo.toString(), userContext);

            if (recommendedIds.isEmpty()) {
                // Fallback: return top-rated products
                return productRepository.findTop10ByActiveTrueOrderByRatingDesc()
                        .stream().map(productService::mapToResponse).collect(Collectors.toList());
            }

            List<Product> recommended = productRepository.findByIdIn(recommendedIds);
            return recommended.stream().map(productService::mapToResponse).collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting recommendations: {}", e.getMessage());
            // Fallback
            return productRepository.findTop10ByActiveTrueOrderByRatingDesc()
                    .stream().map(productService::mapToResponse).collect(Collectors.toList());
        }
    }

    public List<ProductDto.ProductResponse> getPublicRecommendations() {
        return productRepository.findTop10ByActiveTrueOrderByRatingDesc()
                .stream().map(productService::mapToResponse).collect(Collectors.toList());
    }

    private List<Long> callGeminiForRecommendations(String productInfo, String userContext) {
        try {
            String prompt = String.format(
                    "You are a product recommendation engine. Based on the user's preferences and available products, "
                            +
                            "recommend the top 8 products that would best match their interests. " +
                            "Return ONLY a JSON array of product IDs, nothing else. Example: [1, 5, 3, 8]\n\n" +
                            "User Context: %s\n\n" +
                            "Available Products:\n%s\n\n" +
                            "Return the recommended product IDs as a JSON array:",
                    userContext, productInfo);

            JsonObject requestBody = new JsonObject();
            JsonArray contents = new JsonArray();
            JsonObject content = new JsonObject();
            JsonArray parts = new JsonArray();
            JsonObject part = new JsonObject();
            part.addProperty("text", prompt);
            parts.add(part);
            content.add("parts", parts);
            contents.add(content);
            requestBody.add("contents", contents);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(geminiApiUrl + "?key=" + geminiApiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonObject responseJson = JsonParser.parseString(response.body()).getAsJsonObject();
                JsonArray candidates = responseJson.getAsJsonArray("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    String text = candidates.get(0).getAsJsonObject()
                            .getAsJsonObject("content")
                            .getAsJsonArray("parts")
                            .get(0).getAsJsonObject()
                            .get("text").getAsString();

                    // Extract JSON array from response
                    int start = text.indexOf('[');
                    int end = text.lastIndexOf(']');
                    if (start != -1 && end != -1) {
                        String jsonArray = text.substring(start, end + 1);
                        JsonArray ids = JsonParser.parseString(jsonArray).getAsJsonArray();
                        List<Long> result = new ArrayList<>();
                        for (JsonElement id : ids) {
                            result.add(id.getAsLong());
                        }
                        return result;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
        }
        return List.of();
    }
}
