package com.soyelectronico.pedidos_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final String jwtSecret = "soy_una_contra_super_ultra_segura_1234567890";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                Claims claims = Jwts.parser()
                        .setSigningKey(jwtSecret.getBytes())
                        .parseClaimsJws(token)
                        .getBody();

                String email = claims.get("email", String.class);
                String rol = claims.get("rol", String.class); // 'admin' o 'cliente'

                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase());
                List<SimpleGrantedAuthority> authorities = List.of(authority);

                User principal = new User(email, "", authorities);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, authorities);

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Guardar el id del usuario como atributo del request (para crear el pedido)
                request.setAttribute("usuarioId", claims.getSubject());

            } catch (SignatureException e) {
                System.out.println("Token JWT inválido: " + e.getMessage());
            } catch (Exception e) {
                System.out.println("Error al procesar token JWT: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
