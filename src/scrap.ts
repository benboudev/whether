import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const dynamic = 'force-dynamic' // This ensures the route is not statically optimized

export async function GET(request: NextRequest) {
    try {
        const response = await fetch('https://www.yiddish24.com/cat/57', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            cache: 'no-store' // This ensures fresh data is fetched every time
        })

        if (!response.ok) {
            throw new Error('Failed to fetch webpage')
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        const articles = $('.bulletin-news-col.text-right.yiddish-player-details.darkred').map((_, element) => {
            const $element = $(element)
            return {
                h1: $element.find('h1').text().trim(),
                p: $element.find('p').text().trim(),
                img: $element.find('img').attr('src') || ''
            }
        }).get()

        return NextResponse.json({ articles })

    } catch (error) {
        console.error('Scraping error:', error)
        return NextResponse.json({ error: 'Failed to scrape website' }, { status: 500 })
    }
}

