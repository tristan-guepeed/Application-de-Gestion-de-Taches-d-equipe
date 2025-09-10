// src/theme.ts
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e6f7ff",
      100: "#b3e5ff",
      200: "#80d4ff",
      300: "#4dc2ff",
      400: "#1ab0ff",
      500: "#0091e6", // couleur principale
      600: "#0072b3",
      700: "#00527f",
      800: "#00334c",
      900: "#00141a",
    },
    card: {
      bg: "#ffffff",
      border: "#e2e8f0",
      hover: "#f7fafc",
    },
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "md",
        fontWeight: "medium",
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
          },
        },
        outline: {
          borderColor: "brand.500",
          color: "brand.500",
          _hover: {
            bg: "brand.50",
          },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: "gray.50",
            _hover: { bg: "gray.100" },
            _focus: { bg: "white", borderColor: "brand.500" },
          },
        },
      },
    },
    Card: {
      baseStyle: {
        bg: "card.bg",
        border: "1px solid",
        borderColor: "card.border",
        borderRadius: "md",
        p: 4,
        boxShadow: "sm",
        _hover: { bg: "card.hover" },
      },
    },
  },
});

export default theme;
