import { useState, useMemo, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Plus, MapPin, Calendar, Gauge, X, Phone, ArrowUpDown, ArrowUp, ArrowDown, Tag, Clock } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import logoImage from "@assets/image_1769171762465.png";
import { FilterPanel, FilterState, emptyFilters, hasActiveFiltersCheck, applyFilters } from "@/components/FilterPanel";
import type { Listing } from "@shared/schema";

/* ── Body-type icons – professional silhouettes (UXWing, no attribution required) ── */
const BODY_TYPES_QUICK = [
  {
    value: "coupe", arLabel: "كوبيه", enLabel: "Coupe",
    svg: (
      <svg viewBox="0 0 122.88 35.03" fill="currentColor" className="w-full h-full">
        <path fillRule="evenodd" clipRule="evenodd" d="M99.42,13.57c5.93,0,10.73,4.8,10.73,10.73c0,5.93-4.8,10.73-10.73,10.73s-10.73-4.8-10.73-10.73C88.69,18.37,93.49,13.57,99.42,13.57L99.42,13.57z M79.05,5c-0.59,1.27-1.06,2.69-1.42,4.23c-0.82,2.57,0.39,3.11,3.19,2.06c2.06-1.23,4.12-2.47,6.18-3.7c1.05-0.74,1.55-1.47,1.38-2.19c-0.34-1.42-3.08-2.16-5.33-2.6C80.19,2.23,80.39,2.11,79.05,5L79.05,5z M23.86,19.31c2.75,0,4.99,2.23,4.99,4.99c0,2.75-2.23,4.99-4.99,4.99c-2.75,0-4.99-2.23-4.99-4.99C18.87,21.54,21.1,19.31,23.86,19.31L23.86,19.31z M99.42,19.31c2.75,0,4.99,2.23,4.99,4.99c0,2.75-2.23,4.99-4.99,4.99c-2.75,0-4.99-2.23-4.99-4.99C94.43,21.54,96.66,19.31,99.42,19.31L99.42,19.31z M46.14,12.5c2.77-2.97,5.97-4.9,9.67-6.76c8.1-4.08,13.06-3.58,21.66-3.58l-2.89,7.5c-1.21,1.6-2.58,2.73-4.66,2.84H46.14L46.14,12.5z M23.86,13.57c5.93,0,10.73,4.8,10.73,10.73c0,5.93-4.8,10.73-10.73,10.73s-10.73-4.8-10.73-10.73C13.13,18.37,17.93,13.57,23.86,13.57L23.86,13.57z M40.82,10.3c3.52-2.19,7.35-4.15,11.59-5.82c12.91-5.09,22.78-6,36.32-1.9c4.08,1.55,8.16,3.1,12.24,4.06c4.03,0.96,21.48,1.88,21.91,4.81l-4.31,5.15c1.57,1.36,2.85,3.03,3.32,5.64c-0.13,1.61-0.57,2.96-1.33,4.04c-1.29,1.85-5.07,3.76-7.11,2.67c-0.65-0.35-1.02-1.05-1.01-2.24c0.06-23.9-28.79-21.18-26.62,2.82H35.48C44.8,5.49,5.04,5.4,12.1,28.7C9.62,31.38,3.77,27.34,0,18.75c1.03-1.02,2.16-1.99,3.42-2.89c-0.06-0.05,0.06,0.19-0.15-0.17c-0.21-0.36,0.51-1.87,1.99-2.74C13.02,8.4,31.73,8.52,40.82,10.3L40.82,10.3z"/>
      </svg>
    ),
  },
  {
    value: "sedan", arLabel: "سيدان", enLabel: "Sedan",
    svg: (
      <svg viewBox="0 0 122.88 42.59" fill="currentColor" className="w-full h-full">
        <path fillRule="evenodd" clipRule="evenodd" d="M0,27.89c0.34-1.89,1.29-3.06,3.17-3.13c-0.16-1.98,0.2-3.65,1.07-5.02c0.41-0.64,0.92-1.21,1.54-1.71c2.18-1.77,4.64-1.96,7.33-2.45c2.6-0.47,5.21-0.87,7.81-1.18c3.15-0.37,6.3-0.62,9.44-0.71c1.46-0.04,1.11,0.04,2.26-0.85c5.66-4.38,11.83-7.97,18.3-11.08C53.18,0.65,56.06,0.1,59.45,0c6.77,0,13.53,0,20.3,0c4.48,0.02,8.29,1.05,11.5,2.98l12.31,9.47c4.1,0.27,8.21,0.54,12.31,0.81c2.51-0.07,4.44,0.79,5.17,3.52v8.31c3.48,0.89,1.21,8.91-0.35,10.67c-1.38,1.55-2.62,1.37-4.47,1.37h-10.97c2.11-15.86-14.06-19.25-20.72-10.61c-2.2,2.85-2.53,6.74-1.62,11.31H33.1c2.55-11.75-5.04-16.54-12.02-15.85c-8.98,0.88-11.34,8.08-9.8,15.99H3.51C1.29,38.07,0.26,36.3,0,33.31V27.89L0,27.89z M93.9,24.75c4.93,0,8.92,3.99,8.92,8.92c0,4.93-3.99,8.92-8.92,8.92c-4.93,0-8.92-3.99-8.92-8.92C84.98,28.74,88.97,24.75,93.9,24.75L93.9,24.75z M23.32,29.41v3.21h3.21C26.14,31.04,24.9,29.8,23.32,29.41L23.32,29.41z M26.53,34.72h-3.21v3.21C24.9,37.54,26.14,36.3,26.53,34.72L26.53,34.72z M21.22,37.93v-3.21h-3.21C18.4,36.3,19.64,37.54,21.22,37.93L21.22,37.93z M18.01,32.62h3.21v-3.21C19.64,29.8,18.4,31.04,18.01,32.62L18.01,32.62z M94.95,29.41v3.21h3.21C97.77,31.04,96.53,29.8,94.95,29.41L94.95,29.41z M98.16,34.72h-3.21v3.21C96.53,37.54,97.77,36.3,98.16,34.72L98.16,34.72z M92.85,37.93v-3.21h-3.21C90.03,36.3,91.27,37.54,92.85,37.93L92.85,37.93z M89.64,32.62h3.21v-3.21C91.27,29.8,90.03,31.04,89.64,32.62L89.64,32.62z M22.27,24.75c4.93,0,8.92,3.99,8.92,8.92c0,4.93-3.99,8.92-8.92,8.92c-4.93,0-8.92-3.99-8.92-8.92C13.35,28.74,17.34,24.75,22.27,24.75L22.27,24.75z M86.83,15.83l1.68-9.88l5.9,7.43l-1.11,1.26l-1.05,1.19H86.83L86.83,15.83z M38.48,11.88v3.84h24.87l1.81-13.37h-6.82c-4.24,0.5-4.93,0.64-8.79,2.68c-3.17,1.68-6.07,3.54-9.16,5.55C39.76,11.01,39.11,11.44,38.48,11.88L38.48,11.88z M69.08,2.2l-2.01,13.52h17.89l1.77-12.09C79.36,1.84,76.27,2.2,69.08,2.2L69.08,2.2z"/>
      </svg>
    ),
  },
  {
    value: "suv", arLabel: "SUV", enLabel: "SUV",
    svg: (
      <svg viewBox="0 0 122.88 61.11" fill="currentColor" className="w-full h-full">
        <path fillRule="evenodd" clipRule="evenodd" d="M65.22,0h26.54h6.63c0.38,0,0.52,0.34,0.68,0.68l2.66,5.53c0.16,0.34-0.31,0.68-0.68,0.68H55.93C52.98,6.9,58.02,0,65.22,0L65.22,0z M23.83,45.74v3.74h3.74C27.12,47.65,25.67,46.19,23.83,45.74L23.83,45.74z M27.57,51.93h-3.74v3.74C25.67,55.22,27.12,53.77,27.57,51.93L27.57,51.93z M21.39,55.67v-3.74h-3.74C18.1,53.77,19.55,55.22,21.39,55.67L21.39,55.67z M17.64,49.49h3.74v-3.74C19.55,46.2,18.1,47.65,17.64,49.49L17.64,49.49z M90.05,45.74v3.74h3.74C93.34,47.65,91.89,46.19,90.05,45.74L90.05,45.74z M93.79,51.93h-3.74v3.74C91.89,55.22,93.34,53.77,93.79,51.93L93.79,51.93z M87.61,55.67v-3.74h-3.74C84.31,53.77,85.76,55.22,87.61,55.67L87.61,55.67z M83.86,49.49h3.74v-3.74C85.76,46.2,84.31,47.65,83.86,49.49L83.86,49.49z M89.66,12.77h3.52c5.08,0.23,7.17,0.05,9.19,1.59c2.5,1.91,3.48,10.35,4.52,14.25c0.07,0.26-0.23,0.5-0.5,0.5H90.88c-0.27,0-0.47-0.22-0.5-0.5l-1.22-15.35C89.14,13,89.39,12.77,89.66,12.77L89.66,12.77z M66.09,12.86h-11.5c-5.25,0-13.89,8.63-16.15,15.61c-0.11,0.34,0.29,0.65,0.65,0.65h25.18c0.36,0,0.6-0.29,0.65-0.65l1.83-14.96C66.78,13.15,66.44,12.86,66.09,12.86L66.09,12.86z M71.07,12.8h14.07c0.27,0,0.48,0.23,0.5,0.5l1.07,15.32c0.02,0.27-0.23,0.5-0.5,0.5H69.24c-0.27,0-0.53-0.23-0.5-0.5l1.83-15.32C70.6,13.02,70.79,12.8,71.07,12.8L71.07,12.8z M22.61,40.31c5.74,0,10.4,4.66,10.4,10.4c0,5.74-4.66,10.4-10.4,10.4c-5.74,0-10.4-4.66-10.4-10.4C12.21,44.97,16.87,40.31,22.61,40.31L22.61,40.31z M1.81,40.78c0.53-0.24,1.11-0.35,1.74-0.34c-0.03-3.28,0.19-6.14,0.95-8.17c0.28-1.17,0.79-2.02,1.47-2.64c2.14-1.91,21.25-3.59,25.28-4.11c4.95-4.84,10.46-9.27,16.33-13.46c1.63-1.38,3.96-2.06,6.9-2.13l46.41-0.04c3.51-0.02,6.21,1.48,7.93,4.85l3.87,11.15l0.88-0.24v-4.34c-0.16-1.45,0.41-2.17,1.52-2.35h5.2c1.43,0.06,2.44,0.78,2.6,2.85v15.42c0.01,1.59-0.57,2.63-2.04,2.85h-4.83c-0.48,0.11-0.33,0.48-0.37,0.99v5.26c-0.35,3.88-1.41,6.88-4.52,7.27h-9.41c0.2-4.56-0.66-8.29-2.75-11.08c-7.59-10.14-24.06-4.1-22.95,11.11H35.58c0.34-4.86-0.58-8.55-2.59-11.2c-7.57-9.99-25.18-4.6-23.1,11.51H3.64C-0.13,53.94-1.36,42.19,1.81,40.78L1.81,40.78z M88.83,40.31c5.74,0,10.4,4.66,10.4,10.4c0,5.74-4.66,10.4-10.4,10.4c-5.74,0-10.4-4.66-10.4-10.4C78.43,44.97,83.08,40.31,88.83,40.31L88.83,40.31z"/>
      </svg>
    ),
  },
  {
    value: "hatchback", arLabel: "هاتش", enLabel: "Hatch",
    svg: (
      <svg viewBox="0 0 122.88 43.49" fill="currentColor" className="w-full h-full">
        <path fillRule="evenodd" clipRule="evenodd" d="M103.94,23.97c5.39,0,9.76,4.37,9.76,9.76c0,5.39-4.37,9.76-9.76,9.76c-5.39,0-9.76-4.37-9.76-9.76C94.18,28.34,98.55,23.97,103.94,23.97L103.94,23.97z M23,29.07v3.51h3.51C26.09,30.86,24.73,29.49,23,29.07L23,29.07z M26.52,34.87H23v3.51C24.73,37.97,26.09,36.6,26.52,34.87L26.52,34.87z M20.71,38.39v-3.51H17.2C17.62,36.6,18.99,37.96,20.71,38.39L20.71,38.39z M17.2,32.59h3.51v-3.51C18.99,29.49,17.62,30.86,17.2,32.59L17.2,32.59z M105.09,29.07v3.51h3.51C108.18,30.86,106.82,29.49,105.09,29.07L105.09,29.07z M108.6,34.87h-3.51v3.51C106.82,37.97,108.18,36.6,108.6,34.87L108.6,34.87z M102.8,38.39v-3.51h-3.51C99.71,36.6,101.07,37.96,102.8,38.39L102.8,38.39z M99.28,32.59h3.51v-3.51C101.07,29.49,99.71,30.86,99.28,32.59L99.28,32.59z M49.29,12.79c-1.54-0.35-3.07-0.35-4.61-0.28C56.73,6.18,61.46,2.07,75.57,2.9l-1.94,12.87L50.4,16.65c0.21-0.61,0.33-0.94,0.37-1.55C50.88,13.36,50.86,13.15,49.29,12.79L49.29,12.79z M79.12,3.13L76.6,15.6l24.13-0.98c2.48-0.1,2.91-1.19,1.41-3.28c-0.68-0.95-1.44-1.89-2.31-2.82C93.59,1.86,87.38,3.24,79.12,3.13L79.12,3.13z M0.46,27.28H1.2c0.46-2.04,1.37-3.88,2.71-5.53c2.94-3.66,4.28-3.2,8.65-3.99l24.46-4.61c5.43-3.86,11.98-7.3,19.97-10.2C64.4,0.25,69.63-0.01,77.56,0c4.54,0.01,9.14,0.28,13.81,0.84c2.37,0.15,4.69,0.47,6.97,0.93c2.73,0.55,5.41,1.31,8.04,2.21l9.8,5.66c2.89,1.67,3.51,3.62,3.88,6.81l1.38,11.78h1.43v6.51c-0.2,2.19-1.06,2.52-2.88,2.52h-2.37c0.92-20.59-28.05-24.11-27.42,1.63H34.76c3.73-17.75-14.17-23.91-22.96-13.76c-2.67,3.09-3.6,7.31-3.36,12.3H2.03c-0.51-0.24-0.91-0.57-1.21-0.98c-1.05-1.43-0.82-5.74-0.74-8.23C0.09,27.55-0.12,27.28,0.46,27.28L0.46,27.28z M21.86,23.97c5.39,0,9.76,4.37,9.76,9.76c0,5.39-4.37,9.76-9.76,9.76c-5.39,0-9.76-4.37-9.76-9.76C12.1,28.34,16.47,23.97,21.86,23.97L21.86,23.97z"/>
      </svg>
    ),
  },
  {
    value: "van", arLabel: "واجن", enLabel: "Wagon",
    svg: (
      <svg viewBox="0 0 122.88 44.67" fill="currentColor" className="w-full h-full">
        <path fillRule="evenodd" clipRule="evenodd" d="M80.99,39.58l-13.79,0.11H34.72c2.68-12.32-5.29-17.34-12.61-16.62c-9.42,0.92-11.9,8.48-10.28,16.77H3.68c-2.33,0.1-3.41-1.76-3.68-4.89v-5.68c0.35-1.99,1.35-3.21,3.32-3.29c-0.17-2.07,0.21-3.83,1.13-5.26c0.42-0.67,0.97-1.27,1.62-1.8c2.29-1.86,4.87-2.06,7.68-2.57c2.73-0.5,5.46-0.91,8.19-1.24c3.3-0.39,6.6-0.65,9.9-0.74c1.53-0.04,1.16,0.04,2.37-0.9c5.94-4.59,12.41-8.35,19.19-11.62C55.77,0.68,58.8,0.1,62.35,0h4.84l25.68,0.12c5.2-0.12,13.97-0.72,17.66,3.47l7.37,8.37c1.01,1.15,1.05,1.19,1.6,2.63l0.77,2c0.53,1.4,0.65,1.49,0.65,2.98v6.37c1.47,0.24,2.01,0.84,1.96,2.73v2.5c0,1.99,0.06,3.28-1.03,5.1c-1.08,1.79-2.84,2.72-5.36,2.71H104.3c1.39-8.31-1.98-15.83-11.39-15.86C86.35,23.1,79.72,28.13,80.99,39.58L80.99,39.58z M24.45,30.84v3.37h3.37C27.42,32.55,26.11,31.25,24.45,30.84L24.45,30.84z M27.82,36.41h-3.37v3.37C26.11,39.37,27.42,38.07,27.82,36.41L27.82,36.41z M22.26,39.78v-3.37h-3.37C19.29,38.07,20.6,39.37,22.26,39.78L22.26,39.78z M18.89,34.21h3.37v-3.37C20.6,31.25,19.29,32.55,18.89,34.21L18.89,34.21z M94.06,30.84v3.37h3.37C97.03,32.55,95.72,31.25,94.06,30.84L94.06,30.84z M97.43,36.41h-3.37v3.37C95.72,39.37,97.03,38.07,97.43,36.41L97.43,36.41z M91.87,39.78v-3.37H88.5C88.9,38.07,90.21,39.37,91.87,39.78L91.87,39.78z M88.5,34.21h3.37v-3.37C90.21,31.25,88.9,32.55,88.5,34.21L88.5,34.21z M40.35,16.78h23.51l1.9-14.02h-4.57c-4.45,0.52-5.17,0.67-9.22,2.81c-3.33,1.77-6.37,3.71-9.6,5.83C39.55,13.25,40.35,13.26,40.35,16.78L40.35,16.78z M69.87,2.62L67.76,16.8h22.22L86.12,2.66L69.87,2.62L69.87,2.62z M89.83,2.51l3.41,14.18h16.1c0.53-0.37,1-0.8,1.4-1.3c0.82-1.02,1.15-1.3,0.46-2.28l-3.07-4.43c-1.47-2.12-2.18-3.64-4.58-4.87c-2.95-1.5-4.92-1.31-8.07-1.31H89.83L89.83,2.51z M92.97,25.95c5.17,0,9.36,4.19,9.36,9.36c0,5.17-4.19,9.36-9.36,9.36c-5.17,0-9.36-4.19-9.36-9.36C83.61,30.14,87.8,25.95,92.97,25.95L92.97,25.95z M23.35,25.95c5.17,0,9.36,4.19,9.36,9.36c0,5.17-4.19,9.36-9.36,9.36c-5.17,0-9.36-4.19-9.36-9.36C14,30.14,18.19,25.95,23.35,25.95L23.35,25.95z"/>
      </svg>
    ),
  },
  {
    value: "pickup", arLabel: "بيكأب", enLabel: "Pickup",
    svg: (
      <svg viewBox="0 0 122.88 57.75" fill="currentColor" className="w-full h-full">
        <path fillRule="evenodd" clipRule="evenodd" d="M55.2,0.01h-2c-4.58,0-10.98-0.3-14.66,2.81C32.26,7.29,27.4,15.21,22.1,20.38c-4.3,0.56-14.26,2.03-16.55,4.07C2.9,26.81,2.93,34.4,2.97,37.62c-4.92-0.1-2.93,11.81,0.26,12.49h6.85c-4.4-26.18,32.92-22.94,27.3,0h38.19c-5.76-21.96,31.01-27.57,27.47-0.21c6.53-0.02,10.06-0.1,16.89,0c2.71-0.62,2.97-2.13,2.97-5.75l-2.66-0.33l0.08-1.5c0.03-0.89,0.06-1.77,0.09-2.65c0.16-5.81,0.14-11.43-0.19-16.74H59.77V5.58C59.87,1.86,58.24,0.12,55.2,0.01L55.2,0.01z M89.87,41.17c3.02,0,5.46,2.45,5.46,5.46s-2.45,5.46-5.46,5.46c-3.02,0-5.46-2.45-5.46-5.46S86.85,41.17,89.87,41.17L89.87,41.17z M54.4,4.74h-8.8c-4.54,0-10.59,6.56-14.02,13.01c-0.35,0.65-3.08,5.18-1.25,5.18H54.4v-0.69V5.44V4.74L54.4,4.74z M23.5,41.17c3.02,0,5.46,2.45,5.46,5.46s-2.45,5.46-5.46,5.46c-3.02,0-5.46-2.45-5.46-5.46S20.48,41.17,23.5,41.17L23.5,41.17z M23.5,35.52c6.14,0,11.11,4.98,11.11,11.11S29.64,57.75,23.5,57.75c-6.14,0-11.11-4.98-11.11-11.11S17.36,35.52,23.5,35.52L23.5,35.52z M89.87,35.52c6.14,0,11.11,4.98,11.11,11.11s-4.98,11.11-11.11,11.11c-6.14,0-11.11-4.98-11.11-11.11S83.73,35.52,89.87,35.52L89.87,35.52z"/>
      </svg>
    ),
  },
  {
    value: "", arLabel: "أخرى", enLabel: "Other",
    svg: (
      <svg viewBox="0 0 100 40" fill="currentColor" className="w-full h-full">
        <circle cx="15" cy="20" r="12"/>
        <circle cx="50" cy="20" r="12"/>
        <circle cx="85" cy="20" r="12"/>
      </svg>
    ),
  },
];

const CAR_MAKES_QUICK = [
  { value: "Toyota", slug: "toyota", arLabel: "تويوتا" },
  { value: "BMW", slug: "bmw", arLabel: "BMW" },
  { value: "Mercedes-Benz", slug: "mercedes-benz", arLabel: "مرسيدس" },
  { value: "Hyundai", slug: "hyundai", arLabel: "هيونداي" },
  { value: "Kia", slug: "kia", arLabel: "كيا" },
  { value: "Nissan", slug: "nissan", arLabel: "نيسان" },
  { value: "Ford", slug: "ford", arLabel: "فورد" },
  { value: "Chevrolet", slug: "chevrolet", arLabel: "شيفروليه" },
  { value: "Volkswagen", slug: "volkswagen", arLabel: "فولكس" },
  { value: "Mitsubishi", slug: "mitsubishi", arLabel: "ميتسوبيشي" },
  { value: "Honda", slug: "honda", arLabel: "هوندا" },
  { value: "Audi", slug: "audi", arLabel: "أودي" },
  { value: "BYD", slug: "byd", arLabel: "BYD" },
];

export default function CarsForSale() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({ ...emptyFilters });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const filteredListings = useMemo(() => {
    const filtered = applyFilters(listings, filters, searchQuery);
    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
      case "oldest":
        sorted.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        break;
      case "priceLow":
        sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "priceHigh":
        sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "yearNew":
        sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;
      case "yearOld":
        sorted.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
        break;
      case "mileageLow":
        sorted.sort((a, b) => (a.mileage ?? Infinity) - (b.mileage ?? Infinity));
        break;
      case "mileageHigh":
        sorted.sort((a, b) => (b.mileage ?? 0) - (a.mileage ?? 0));
        break;
    }
    return sorted;
  }, [listings, filters, searchQuery, sortBy]);

  const hasActiveFilters = searchQuery || hasActiveFiltersCheck(filters);

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({ ...emptyFilters });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    for (const [, v] of Object.entries(filters)) {
      if (Array.isArray(v)) { if (v.length > 0) count++; }
      else if (v !== "") count++;
    }
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Modern page header */}
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">
              <span className="w-6 h-px bg-primary inline-block" />
              {language === "ar" ? "المعرض" : "Showroom"}
              <span className="w-6 h-px bg-primary inline-block" />
            </span>
            <h1
              className="text-3xl md:text-5xl font-black leading-tight mt-[0px] mb-[0px] pt-[8px] pb-[8px]"
              data-testid="text-cars-for-sale-title"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--foreground)) 55%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              {t("marketplace.title")}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base flex items-center gap-2">
              {t("marketplace.subtitle")}
              <span className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold text-xs px-2.5 py-0.5 rounded-full">
                {filteredListings.length}
              </span>
            </p>
          </div>
          {user && (
            <Link href="/add-listing">
              <Button data-testid="button-add-listing">
                <Plus className="w-4 h-4" />
                <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.addListing")}</span>
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input
                placeholder={t("marketplace.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={language === "ar" ? "pr-10" : "pl-10"}
                data-testid="input-search-listings"
              />
            </div>
            <SortPopover sortBy={sortBy} setSortBy={setSortBy} language={language} />
            <Button
              variant="outline"
              onClick={() => setShowFilterPanel(true)}
              className="relative"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4" />
              <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.filter")}</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} data-testid="button-clear-filters">
                <X className="w-4 h-4" />
                <span className={language === "ar" ? "mr-1" : "ml-1"}>{t("admin.filter.clear")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Body Type + Make Filter Bar — visible to all users */}
        <div className="mb-8 space-y-5">
          {/* Body Type */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {language === "ar" ? "نوع الهيكل" : "Body Type"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {BODY_TYPES_QUICK.map((bt) => {
                const active = bt.value !== "" && filters.bodyType === bt.value;
                return (
                  <button
                    key={bt.value || "other"}
                    onClick={() => setFilters(f => ({ ...f, bodyType: active ? "" : bt.value }))}
                    className={`flex flex-col items-center gap-2 min-w-[82px] px-3 py-3 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                    data-testid={`button-body-type-${bt.value}`}
                  >
                    <span className="w-16 h-9">{bt.svg}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide leading-none">
                      {language === "ar" ? bt.arLabel : bt.enLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Car Make */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {language === "ar" ? "الماركة" : "Make"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {CAR_MAKES_QUICK.map((make) => {
                const active = filters.make === make.value;
                return (
                  <button
                    key={make.value}
                    onClick={() => setFilters(f => ({ ...f, make: active ? "" : make.value }))}
                    className={`flex flex-col items-center gap-2 min-w-[82px] px-3 py-3 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                    data-testid={`button-make-${make.slug}`}
                  >
                    <img
                      src={`https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/${make.slug}.png`}
                      alt={make.value}
                      className="w-12 h-12 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className={`text-[11px] font-semibold uppercase tracking-wide leading-none ${active ? "text-primary" : "text-muted-foreground"}`}>
                      {language === "ar" ? make.arLabel : make.value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 md:h-80 w-full rounded-md bg-secondary" />
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-md border border-border border-dashed">
            <Search className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2" data-testid="text-no-listings">
              {t("marketplace.noListings")}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {t("marketplace.noListingsDesc")}
            </p>
            {user && (
              <Link href="/add-listing">
                <Button className="mt-6" data-testid="button-add-first-listing">
                  <Plus className="w-4 h-4" />
                  <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.addFirstListing")}</span>
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
      <footer className="py-6 border-t border-border bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt={t("common.altLogo")} className="h-8 w-auto" />
              <span className="text-sm text-muted-foreground">{t("landing.brandName")}</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://wa.me/962796796108" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="WhatsApp" data-testid="footer-cfs-whatsapp">
                <SiWhatsapp className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/golden.frond.gallery" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook" data-testid="footer-cfs-facebook">
                <SiFacebook className="w-4 h-4" />
              </a>
              <a href="tel:0796796108" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Phone" data-testid="footer-cfs-phone">
                <Phone className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {t("landing.copyright")}
            </p>
          </div>
        </div>
      </footer>
      <FilterPanel
        open={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        filters={filters}
        onFiltersChange={setFilters}
        listings={listings}
        filteredCount={filteredListings.length}
      />
    </div>
  );
}

function SortPopover({ sortBy, setSortBy, language }: { sortBy: string; setSortBy: (v: string) => void; language: string }) {
  const [open, setOpen] = useState(false);
  const ar = language === "ar";

  const categories = [
    {
      key: "posted",
      icon: Clock,
      label: ar ? "تاريخ النشر" : "Posted",
      color: "from-violet-500/20 to-violet-500/5",
      iconColor: "text-violet-500",
      high: { value: "newest", label: ar ? "الأحدث" : "Newest" },
      low:  { value: "oldest", label: ar ? "الأقدم" : "Oldest" },
    },
    {
      key: "year",
      icon: Calendar,
      label: ar ? "سنة الصنع" : "Year",
      color: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
      high: { value: "yearNew", label: ar ? "الأحدث" : "Newest" },
      low:  { value: "yearOld", label: ar ? "الأقدم" : "Oldest" },
    },
    {
      key: "price",
      icon: Tag,
      label: ar ? "السعر" : "Price",
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
      high: { value: "priceHigh", label: ar ? "الأعلى" : "Highest" },
      low:  { value: "priceLow",  label: ar ? "الأقل"  : "Lowest" },
    },
    {
      key: "mileage",
      icon: Gauge,
      label: ar ? "الكيلومترات" : "Mileage",
      color: "from-orange-500/20 to-orange-500/5",
      iconColor: "text-orange-500",
      high: { value: "mileageHigh", label: ar ? "الأعلى" : "Highest" },
      low:  { value: "mileageLow",  label: ar ? "الأقل"  : "Lowest" },
    },
  ];

  const isActive = sortBy !== "newest";

  const activeLabel = (() => {
    if (!isActive) return ar ? "ترتيب" : "Sort";
    for (const c of categories) {
      if (sortBy === c.high.value) return `${c.label} · ${c.high.label}`;
      if (sortBy === c.low.value)  return `${c.label} · ${c.low.label}`;
    }
    return ar ? "ترتيب" : "Sort";
  })();

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={`gap-2 whitespace-nowrap transition-all ${isActive ? "border-primary text-primary bg-primary/5" : ""}`}
        data-testid="button-sort"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span>{activeLabel}</span>
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-base text-foreground">{ar ? "ترتيب حسب" : "Sort By"}</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categories grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isHighActive = sortBy === cat.high.value;
                const isLowActive  = sortBy === cat.low.value;
                const isCatActive  = isHighActive || isLowActive;
                return (
                  <div
                    key={cat.key}
                    className={`rounded-xl border-2 overflow-hidden transition-all ${isCatActive ? "border-primary" : "border-border"}`}
                  >
                    {/* Category header */}
                    <div className={`bg-gradient-to-br ${cat.color} px-3 py-3 flex items-center gap-2`}>
                      <div className={`w-7 h-7 rounded-lg bg-background/60 flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                      </div>
                      <span className="text-sm font-bold text-foreground">{cat.label}</span>
                    </div>
                    {/* High / Low buttons */}
                    <div className="flex border-t border-border">
                      <button
                        onClick={() => { setSortBy(cat.high.value); setOpen(false); }}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors border-r border-border ${isHighActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"}`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                        {cat.high.label}
                      </button>
                      <button
                        onClick={() => { setSortBy(cat.low.value); setOpen(false); }}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${isLowActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"}`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        {cat.low.label}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reset footer */}
            {isActive && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => { setSortBy("newest"); setOpen(false); }}
                  className="w-full py-2 rounded-xl border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  {ar ? "إعادة تعيين الترتيب" : "Reset Sort"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const ListingCard = memo(function ListingCard({ listing }: { listing: Listing }) {
  const { t, language } = useLanguage();
  const title = [listing.make, listing.model].filter(Boolean).join(" ") || t("marketplace.vehicle");

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="overflow-hidden cursor-pointer hover-elevate transition-all group" data-testid={`listing-card-${listing.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={listing.imageUrl || ""}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-car.svg"; }}
          />
          {listing.images && listing.images.length > 0 && (
            <div className={`absolute bottom-2 ${language === "ar" ? "left-2" : "right-2"} bg-black/60 text-white text-xs px-2 py-1 rounded-md`}>
              {listing.images.length + 1}
            </div>
          )}
          <div className={`absolute top-2 ${language === "ar" ? "right-2" : "left-2"}`}>
            <span className={`text-xs px-2 py-1 rounded-md font-medium ${
              listing.condition === "new"
                ? "bg-green-500/90 text-white"
                : "bg-blue-500/90 text-white"
            }`}>
              {listing.condition === "new" ? t("marketplace.conditionNew") : t("marketplace.conditionUsed")}
            </span>
          </div>
        </div>
        <div className="p-2.5 md:p-4">
          <h3 className="font-bold text-foreground text-sm md:text-lg leading-tight mb-1 truncate">
            {title}
          </h3>
          <p className="text-primary font-bold text-sm md:text-xl mb-1.5 md:mb-3" data-testid={`text-price-${listing.id}`}>
            {listing.price ? `${listing.price.toLocaleString()} ${t("marketplace.currency")}` : t("marketplace.priceOnRequest")}
          </p>
          <div className="flex items-center gap-1.5 md:gap-3 text-xs md:text-sm text-muted-foreground flex-wrap">
            {listing.year && (
              <span className="flex items-center gap-0.5 md:gap-1">
                <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {listing.year}
              </span>
            )}
            {listing.mileage && (
              <span className="flex items-center gap-0.5 md:gap-1">
                <Gauge className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {listing.mileage.toLocaleString()}
              </span>
            )}
            {listing.location && (
              <span className="hidden md:flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {listing.location}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
});
